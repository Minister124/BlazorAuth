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
using Mapster;
using Microsoft.AspNetCore.Identity;
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

        public AccountRepository(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<ApplicationUser> signInManager,
            ILogger<AccountRepository> logger
        )
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _logger = logger;
        }

        private async Task<ApplicationUser> FindUserByEmailAsync(string email) =>
            await _userManager.FindByEmailAsync(email)
            ?? throw new InvalidOperationException($"Email {email} not found");

        private async Task<ApplicationUser> FindUserByUserNameAsync(string userName) =>
            await _userManager.FindByNameAsync(userName)
            ?? throw new InvalidOperationException($"Username {userName} not found");

        private async Task<IdentityRole> FindRoleByNameAsync(string roleName) =>
            await _roleManager.FindByNameAsync(roleName)
            ?? throw new InvalidOperationException($"Role {roleName} not found");

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

        private async Task<GeneralResponse> AssignUserToRole(
            ApplicationUser applicationUser,
            IdentityRole identityRole
        )
        {
            if (applicationUser == null || identityRole == null)
                return new GeneralResponse(false, "Model state cannot be empty");

            if (await FindRoleByNameAsync(identityRole.Name) == null)
                await CreateRoleAsync(identityRole.Adapt(new CreateRoleDTO()));

            IdentityResult result = await _userManager.AddToRoleAsync(
                applicationUser,
                identityRole.Name
            );
            return result.ToGeneralResponse(
                $"Assigned {applicationUser.Name} role {identityRole.Name}"
            );
        }

        public Task<GeneralResponse> ChangeUserRoleRequestAsync(ChangeUserRoleRequest model)
        {
            throw new NotImplementedException();
        }

        public async Task<GeneralResponse> CreateAccountAsync(CreateAccountDTO model)
        {
            try
            {
                if (await FindUserByEmailAsync(model.EmailAddress) != null)
                    return new GeneralResponse(false, $"{model.EmailAddress} already Exist.");
                if (await FindUserByUserNameAsync(model.UserName) != null)
                    return new GeneralResponse(false, $"{model.UserName} already exists.");
                var user = new ApplicationUser()
                {
                    Name = model.Name,
                    UserName = model.UserName,
                    Email = model.EmailAddress,
                    PasswordHash = model.Password,
                };
                var result = await _userManager.CreateAsync(user);
                result.ToGeneralResponse($"Account Created Sucessfully");

                var (flag, messgae) = await AssignUserToRole(
                    user,
                    new IdentityRole() { Name = model.Role }
                );
                return new GeneralResponse(flag, messgae);
            }
            catch (Exception ex)
            {
                return new GeneralResponse(false, ex.Message);
            }
        }

        public async Task CreateAdmin()
        {
            try
            {
                if (await FindRoleByNameAsync(Constants.Role.Admin) != null)
                    return;
                var admin = new CreateAccountDTO()
                {
                    Name = "Admin",
                    EmailAddress = "admin123@gmail.com",
                    Password = "Admin123",
                    Role = Constants.Role.Admin,
                };
                await CreateAccountAsync(admin);
            }
            catch (System.Exception)
            {
                throw;
            }
        }

        public Task<GeneralResponse> CreateRoleAsync(CreateRoleDTO model)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<GetRoleDTO>> GetRoleAsynce()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<GetUsersWithRolesResponseDTO>> GetUsersWithRolesResponseAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<LoginResponse> LoginAsync(LoginDTO model)
        {
            try
            {
                _logger.LogInformation(
                    "Login attempt for user {EmailorUserName}",
                    model.EmailAddress ?? model.UserName
                );
                var user =
                    await FindUserByEmailAsync(model.EmailAddress)
                    ?? await FindUserByUserNameAsync(model.UserName);
                if (user == null)
                {
                    _logger.LogWarning(
                        "Login Failed for {EmailorUserName}: User not found",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Invalid username or password");
                }

                SignInResult signInResult;
                try
                {
                    signInResult = await _signInManager.CheckPasswordSignInAsync(
                        user,
                        model.Password,
                        false
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Login failed for {EmailOrUserName}: Exception during sign-in",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Invalid Credentials");
                }

                if (!signInResult.Succeeded)
                {
                    _logger.LogWarning(
                        "Login failed for {EmailOrUserName}: Invalid credentials",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Invalid Credentials");
                }
                var token = await GenerateTokenAsync(user);
                var refreshToken = GenerateRefreshToken();
                if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(refreshToken))
                {
                    _logger.LogError(
                        "Token generation failed for {EmailOrUserName}",
                        model.EmailAddress ?? model.UserName
                    );
                    return new LoginResponse(false, "Please contact the administrator");
                }

                _logger.LogInformation(
                    "Login successful for {EmailOrUserName}",
                    model.EmailAddress ?? model.UserName
                );
                return new LoginResponse(true, "Login Successful", token, refreshToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "An error occurred during the login process for {EmailOrUserName}",
                    model.EmailAddress ?? model.UserName
                );
                return new LoginResponse(false, ex.Message);
            }
        }
    }
}
