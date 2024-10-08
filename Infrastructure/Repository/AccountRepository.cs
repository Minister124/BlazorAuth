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
                    expires: DateTime.UtcNow.AddMinutes(30),
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

                // Convert the IdentityResult to a GeneralResponse for success message.
                result.ToGeneralResponse($"Account Created Successfully");

                // Assign the user to the specified role.
                var (flag, message) = await AssignUserToRole(
                    user,
                    new IdentityRole() { Name = model.Role }
                );

                // Return the result of role assignment.
                return new GeneralResponse(flag, message);
            }
            catch (Exception ex)
            {
                // Handle any exceptions and return a failure response with the exception message.
                return new GeneralResponse(false, ex.Message);
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

        public async Task<LoginResponse> LoginAsync(LoginDTO model)
        {
            try
            {
                // Log the start of a login attempt with either the EmailAddress or UserName provided by the user.
                _logger.LogInformation(
                    "Login attempt for user {EmailorUserName}",
                    model.EmailAddress ?? model.UserName
                );

                // Attempt to find the user by email first, if not found, then by username.
                var user =
                    await FindUserByEmailAsync(model.EmailAddress)
                    ?? await FindUserByUserNameAsync(model.UserName);

                if (user == null)
                {
                    // Log a warning if the user is not found.
                    _logger.LogWarning(
                        "Login Failed for {EmailorUserName}: User not found",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Invalid username or password");
                }

                SignInResult signInResult;
                try
                {
                    // Attempt to sign in the user using their password.
                    signInResult = await _signInManager.CheckPasswordSignInAsync(
                        user,
                        model.Password,
                        false // Lockout on failure is disabled.
                    );
                }
                catch (Exception ex)
                {
                    // Log an error if an exception occurs during the sign-in process.
                    _logger.LogError(
                        ex,
                        "Login failed for {EmailOrUserName}: Exception during sign-in",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Invalid Credentials");
                }

                if (!signInResult.Succeeded)
                {
                    // Log a warning if the credentials are invalid.
                    _logger.LogWarning(
                        "Login failed for {EmailOrUserName}: Invalid credentials",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Invalid Credentials");
                }

                // Generate JWT and refresh tokens for the user.
                var token = await GenerateTokenAsync(user);
                var refreshToken = GenerateRefreshToken();

                if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(refreshToken))
                {
                    // Log an error if token generation fails.
                    _logger.LogError(
                        "Token generation failed for {EmailOrUserName}",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Please contact the administrator");
                }
                else
                {
                    // Attempt to save the refresh token for the user.
                    var saveResult = await SaveRefreshToken(user.Id, refreshToken);
                    if (saveResult.flag)
                        return new LoginResponse(
                            true,
                            $"{user.Name} successfully logged in",
                            token,
                            refreshToken
                        );
                    else
                        return new LoginResponse();
                }
            }
            catch (Exception ex)
            {
                // Log any unhandled exceptions during the login process.
                _logger.LogError(
                    ex,
                    "An error occurred during the login process for {EmailOrUserName}",
                    model.EmailAddress ?? model.UserName
                );
                return new LoginResponse(false, ex.Message);
            }
        }

        public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenDTO model)
        {
            // Look for the refresh token in the database.
            var token = await _context.RefreshTokens.FirstOrDefaultAsync(x =>
                x.Token == model.Token
            );
            if (token == null)
                return new LoginResponse();

            // Retrieve the user associated with the refresh token.
            var user = await _userManager.FindByIdAsync(token.UserID);

            // Generate new JWT and refresh tokens.
            string newToken = await GenerateTokenAsync(user);
            string refreshToken = GenerateRefreshToken();

            // Save the new refresh token in the database.
            var saveResult = await SaveRefreshToken(user.Id, refreshToken);
            if (saveResult.flag)
                return new LoginResponse(
                    true,
                    $"{user.Name} successfully re-logged in",
                    newToken,
                    refreshToken
                );
            else
                return new LoginResponse();
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
    }
}
