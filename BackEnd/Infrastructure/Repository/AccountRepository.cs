using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;
using Application.Extensions;
using Application.IRepository;
using Domain.Entity.Authentication;
using Infrastructure.Data;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Repository
{
    public class AccountRepository : IAccount
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        private readonly SignInManager<ApplicationUser> _signInManager;

        private readonly ILogger<AccountRepository> _logger;

        private readonly AppDbContext _context;

        public AccountRepository(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<ApplicationUser> signInManager,
            ILogger<AccountRepository> logger,
            AppDbContext context
        )
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _logger = logger;
            _context = context;
        }

        private async Task<ApplicationUser> FindUserByEmailAsync(string email) =>
            await _userManager.FindByEmailAsync(email);

        private async Task<ApplicationUser> FindUserByUserNameAsync(string userName) =>
            await _userManager.FindByNameAsync(userName);

        private async Task<IdentityRole> FindRoleByNameAsync(string roleName) =>
            await _roleManager.FindByNameAsync(roleName);

        private static string GenerateRefreshToken() =>
            Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        private async Task<string> GenerateTokenAsync(ApplicationUser applicationUser)
        {
            try
            {
                var secuityKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
                );
                var credential = new SigningCredentials(secuityKey, SecurityAlgorithms.HmacSha256);

                //list of claims to add in token. This provides more flexibility then fixed array lai new[];
                var userClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, applicationUser.UserName ?? "No UserName"),
                    new Claim(ClaimTypes.Email, applicationUser.Email ?? "No Email"),
                    new Claim("FullName", applicationUser.Name ?? "No FullName"),
                    new Claim(
                        JwtRegisteredClaimNames.Jti,
                        Guid.NewGuid().ToString()
                    ) //Adding a unique identifier to the token
                    ,
                };

                // Retrieve all roles associated with the user and add them as individual claims
                var userRoles = await _userManager.GetRolesAsync(applicationUser);
                userClaims.AddRange(
                    userRoles.Select(x => new Claim(ClaimTypes.Role, x ?? "No Role"))
                );

                // Create the token using the collected claims and signing credentials
                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: userClaims,
                    expires: DateTime.UtcNow.AddDays(2),
                    signingCredentials: credential
                );
                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch
            {
                return null!;
            }
        }

        // Method to assign a user to a specific role.
        private async Task<GeneralResponse> AssignUserToRole(
            ApplicationUser applicationUser, // The user to whom the role is being assigned.
            IdentityRole identityRole // The role to assign to the user.
        )
        {
            // Check if the user or role is null, return an error response if either is missing.
            if (applicationUser == null || identityRole == null)
                return new GeneralResponse(false, "Model state cannot be empty");

            // Check if the role already exists. If it doesn't, create the role.
            if (await FindRoleByNameAsync(identityRole.Name) == null)
                await CreateRoleAsync(identityRole.Adapt(new CreateRoleDTO()));
            // Adapt method is likely converting the IdentityRole to a CreateRoleDTO.

            // Attempt to assign the role to the user.
            IdentityResult result = await _userManager.AddToRoleAsync(
                applicationUser,
                identityRole.Name
            );

            // Convert the result of the role assignment into a GeneralResponse.
            return result.ToGeneralResponse(
                $"Assigned {applicationUser.Name} role {identityRole.Name}"
            );
        }

        public async Task<GeneralResponse> ChangeUserRoleRequestAsync(ChangeUserRoleRequest model)
        {
            // Check if user and role exist
            if (await FindUserByEmailAsync(model.userEmail) == null)
                return new GeneralResponse(false, "User not found");

            if (await FindRoleByNameAsync(model.RoleName) == null)
                return new GeneralResponse(false, "Role not found");

            var user = await _userManager.FindByEmailAsync(model.userEmail);
            var previousRole = (await _userManager.GetRolesAsync(user!)).FirstOrDefault();

            // Case where user has no previous role
            if (previousRole == null)
                return new GeneralResponse(false, "User has no role assigned");

            // Remove the previous role
            var removePreviousRole = await _userManager.RemoveFromRoleAsync(user!, previousRole);
            var response = removePreviousRole.ToGeneralResponse(
                $"Role Removed Successfully from User {user!.UserName}"
            );

            if (!removePreviousRole.Succeeded)
                return new GeneralResponse(false, "Failed Remove Previous Role"); // Return if role removal fails

            // Add the new role
            var newRole = await _userManager.AddToRoleAsync(user!, model.RoleName);
            return newRole.ToGeneralResponse(
                $"Role changed to {model.RoleName} successfully for {user!.UserName}"
            );
        }

        // Method to create a new user account.
        public async Task<GeneralResponse> CreateAccountAsync(CreateAccountDTO model)
        {
            try
            {
                // Check if this is the first user
                var userCount = await _userManager.Users.CountAsync();
                if (userCount == 0)
                {
                    // Automatically assign admin role to the first user
                    model.Role = "Admin";
                    _logger.LogInformation("First user detected. Assigning Admin role.");
                }

                // Check if the email is already in use.
                if (await FindUserByEmailAsync(model.EmailAddress) != null)
                    return new GeneralResponse(false, $"{model.EmailAddress} already exists.");

                // Check if the username is already in use.
                if (await FindUserByUserNameAsync(model.UserName) != null)
                    return new GeneralResponse(false, $"{model.UserName} already exists.");

                // Create a new ApplicationUser instance with the provided details.
                var user = new ApplicationUser()
                {
                    Name = model.Name,
                    UserName = model.UserName,
                    Email = model.EmailAddress,
                    PasswordHash = model.Password, // Password should be hashed properly using a password hasher.
                };

                // Attempt to create the user in the system.
                var result = await _userManager.CreateAsync(user, model.Password);

                if (!result.Succeeded)
                {
                    // Log any errors during user creation
                    var errors = result.Errors.Select(e => e.Description);
                    _logger.LogError("User creation failed: {Errors}", string.Join(", ", errors));
                    return new GeneralResponse(false, "Failed to create user account");
                }

                // Ensure the role exists before assigning
                if (!await _roleManager.RoleExistsAsync(model.Role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(model.Role));
                }

                // Assign the user to the specified role.
                var roleResult = await _userManager.AddToRoleAsync(user, model.Role);

                if (!roleResult.Succeeded)
                {
                    // Log any errors during role assignment
                    var roleErrors = roleResult.Errors.Select(e => e.Description);
                    _logger.LogError("Role assignment failed: {Errors}", string.Join(", ", roleErrors));
                    return new GeneralResponse(false, "Failed to assign user role");
                }

                _logger.LogInformation("User {UserName} created with role {Role}", user.UserName, model.Role);

                return new GeneralResponse(true, $"Account Created Successfully with {model.Role} role");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during account creation for {Email}", model.EmailAddress);
                return new GeneralResponse(false, $"An error occurred: {ex.Message}");
            }
        }

        // Method to create an Admin user if it doesn't already exist.
        public async Task CreateAdmin()
        {
            try
            {
                // Check if the Admin role already exists. If it does not, Create Admin Role.
                if (await FindRoleByNameAsync(Constants.Role.Admin) == null)
                {
                    await CreateRoleAsync(new CreateRoleDTO { Name = Constants.Role.Admin });
                }

                // Create a new CreateAccountDTO object with Admin user details.
                var admin = new CreateAccountDTO()
                {
                    Name = "Admin",
                    UserName = "Don_Dada",
                    EmailAddress = "admin123@gmail.com",
                    Password = "Admin@12345", // The password should be stored securely (this is just a sample).
                    Role = Constants.Role.Admin,
                };

                // Create the Admin account using the CreateAccountAsync method.
                await CreateAccountAsync(admin);
            }
            catch (Exception ex){
                _logger.LogError(ex, "An error occurred while creating the Admin account.");
            }
        }

        // Placeholder method for creating a role
        public async Task<GeneralResponse> CreateRoleAsync(CreateRoleDTO model)
        {
            try
            {
                // Check if the role already exists
                if (await FindRoleByNameAsync(model.Name) != null)
                {
                    _logger.LogWarning("Role {Name} already exists", model.Name);
                    return new GeneralResponse(false, "Role already exists.");
                }

                // Create a new IdentityRole object from the DTO
                var identityRole = new IdentityRole { Name = model.Name };

                // Use RoleManager to create the role
                var result = await _roleManager.CreateAsync(identityRole);

                // Log the creation attempt and return the appropriate response
                if (result.Succeeded)
                {
                    _logger.LogInformation("Role {RoleName} created successfully", model.Name);
                    return new GeneralResponse(true, "Role created successfully.");
                }
                else
                {
                    var errorMessage = string.Join(",", result.Errors.Select(e => e.Description));
                    _logger.LogError("Role creation failed: {Errors}", errorMessage);
                    return new GeneralResponse(false, errorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "An error occurred while creating the role {RoleName}",
                    model.Name
                );
                return new GeneralResponse(false, ex.Message);
            }
        }

        // method for getting roles
        public async Task<IEnumerable<GetRoleDTO>> GetRoleAsync()
        {
            return (await _roleManager.Roles.ToListAsync()).Adapt<IEnumerable<GetRoleDTO>>();
        }

        // Method to get a list of users along with their roles.
        public async Task<
            IEnumerable<GetUsersWithRolesResponseDTO>
        > GetUsersWithRolesResponseAsync()
        {
            // Retrieve all users in the system.
            var allUsers = await _userManager.Users.ToListAsync();

            // If there are no users, return null.
            if (allUsers == null)
                return null;

            // Create a list to store the user-role information.
            var List = new List<GetUsersWithRolesResponseDTO>();

            // Iterate through each user.
            foreach (var user in allUsers)
            {
                // Get the role name assigned to the user (assuming a single role).
                var getUserRole = (await _userManager.GetRolesAsync(user)).FirstOrDefault();

                // Retrieve the role information based on the role name.
                var getRoleInfo = await _roleManager.Roles.FirstOrDefaultAsync(r =>
                    r.Name.ToLower() == getUserRole.ToLower()
                );

                // Add the user's details and their role to the list.
                List.Add(
                    new GetUsersWithRolesResponseDTO()
                    {
                        Name = user.Name, // User's name.
                        Email = user.Email, // User's email.
                        RoleId = getRoleInfo.Id, // Role ID.
                        RoleName = getRoleInfo.Name, // Role name.
                    }
                );
            }

            // Return the list of users with their roles.
            return List;
        }

        private async Task<LoginResponse> GenerateLoginResponseAsync(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            var userDto = new UserDTO
            {
                Id = user.Id,
                Email = user.Email!,
                Name = user.UserName!,
                Role = role,
                DepartmentId = user.DepartmentId
            };

            var token = await GenerateTokenAsync(user);
            var refreshToken = GenerateRefreshToken();

            // Save refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserID = user.Id,
                Token = refreshToken
            };
            await _context.RefreshTokens.AddAsync(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return new LoginResponse
            {
                User = userDto,
                Token = token,
                RefreshToken = refreshToken
            };
        }

        public async Task<LoginResponse> LoginAsync(LoginDTO model)
        {
            try
            {
                var user = await FindUserByEmailAsync(model.EmailAddress!);
                if (user == null)
                {
                    return new LoginResponse
                    {
                        User = null!,
                        Token = string.Empty,
                        RefreshToken = string.Empty
                    };
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
                if (!result.Succeeded)
                {
                    return new LoginResponse
                    {
                        User = null!,
                        Token = string.Empty,
                        RefreshToken = string.Empty
                    };
                }

                return await GenerateLoginResponseAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return new LoginResponse
                {
                    User = null!,
                    Token = string.Empty,
                    RefreshToken = string.Empty
                };
            }
        }

        public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenDTO model)
        {
            try
            {
                var refreshToken = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == model.Token);

                if (refreshToken == null)
                {
                    return new LoginResponse
                    {
                        User = null!,
                        Token = string.Empty,
                        RefreshToken = string.Empty
                    };
                }

                var user = await _userManager.FindByIdAsync(refreshToken.UserID!);
                if (user == null)
                {
                    return new LoginResponse
                    {
                        User = null!,
                        Token = string.Empty,
                        RefreshToken = string.Empty
                    };
                }

                // Remove old refresh token
                _context.RefreshTokens.Remove(refreshToken);
                await _context.SaveChangesAsync();

                return await GenerateLoginResponseAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return new LoginResponse
                {
                    User = null!,
                    Token = string.Empty,
                    RefreshToken = string.Empty
                };
            }
        }

        public async Task<GeneralResponse> SaveRefreshToken(string userId, string token)
        {
            try
            {
                // Log the start of the refresh token save attempt.
                _logger.LogInformation(
                    "Save Refresh token attempt for userId {userIDorToken}",
                    userId ?? token
                );

                // Check if a refresh token already exists for the given userId.
                var user = await _context.RefreshTokens.FirstOrDefaultAsync(x =>
                    x.UserID == userId
                );

                if (user == null)
                {
                    // If no existing token, create a new one for the user.
                    _context.RefreshTokens.Add(
                        new RefreshToken() { UserID = userId, Token = token }
                    );
                }
                else
                {
                    // If a token already exists, update it with the new token.
                    user.Token = token;
                }

                // Save changes to the database.
                await _context.SaveChangesAsync();

                // Return a successful response indicating that the token was saved.
                return new GeneralResponse(true, null!);
            }
            catch (Exception ex)
            {
                // Log any exceptions that occur during the token save process.
                _logger.LogError(
                    ex,
                    "An error occurred while saving the refresh token for userId {userIDorToken}",
                    userId ?? token
                );

                // Return a response indicating failure along with the exception message.
                return new GeneralResponse(false, ex.Message);
            }
        }

        public async Task<bool> InvalidateRefreshTokenAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return false;

                // Clear refresh tokens for the user
                var refreshTokens = await _context.RefreshTokens
                    .Where(rt => rt.UserID == userId)
                    .ToListAsync();

                _context.RefreshTokens.RemoveRange(refreshTokens);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating refresh token for user {UserId}", userId);
                return false;
            }
        }

        public async Task<UserDTO?> GetUserByIdAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return null;

                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "User";

                return new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email!,
                    Name = user.UserName!,
                    Role = role,
                    DepartmentId = user.DepartmentId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID {UserId}", userId);
                return null;
            }
        }
    }
}
