using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;
using Application.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowSpecificOrigins")]
    [Authorize]  // Require authentication by default
    public class AccountController(IAccount account, ILogger<AccountController> _logger) : ControllerBase
    {
        [AllowAnonymous]  // Allow anonymous access for registration
        [HttpPost("identity/create")]
        public async Task<ActionResult<GeneralResponse>> CreateAccount(CreateAccountDTO model)
        {
            _logger.LogInformation("Registration attempt for user {Email}", model.EmailAddress);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for registration: {Errors}", 
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest("Model Cannot be Null");
            }

            var result = await account.CreateAccountAsync(model);
            if (result.flag)
            {
                _logger.LogInformation("Registration successful for user {Email}", model.EmailAddress);
            }
            else
            {
                _logger.LogWarning("Registration failed for user {Email}: {Message}", 
                    model.EmailAddress, result.message);
            }
            return Ok(result);
        }

        [AllowAnonymous]  // Allow anonymous access for login
        [HttpPost("identity/login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginDTO model)
        {
            _logger.LogInformation("Login attempt for user {Email}", model.EmailAddress);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for login: {Errors}", 
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest("Model Cannot be Null");
            }

            var result = await account.LoginAsync(model);
            if (result.Token != null)
            {
                _logger.LogInformation("Login successful for user {Email}", model.EmailAddress);
            }
            else
            {
                _logger.LogWarning("Login failed for user {Email}", model.EmailAddress);
            }
            return Ok(result);
        }

        [AllowAnonymous]  // Allow anonymous access for refresh token
        [HttpPost("identity/refresh-token")]
        public async Task<ActionResult<GeneralResponse>> RefreshToken(RefreshTokenDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.RefreshTokenAsync(model));
        }

        [Authorize(Roles = "Admin")]  // Only admin can create roles
        [HttpPost("identity/role/create")]
        public async Task<ActionResult<GeneralResponse>> CreateRole(CreateRoleDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.CreateRoleAsync(model));
        }

        [Authorize(Roles = "Admin")]  // Only admin can list roles
        [HttpPost("identity/role/list")]
        public async Task<ActionResult<IEnumerable<GetRoleDTO>>> GetRoles() =>
            Ok(await account.GetRoleAsync());

        [Authorize(Roles = "Admin")]  // Only admin can create admin
        [HttpPost("identity/admin/create")]
        public async Task<IActionResult> CreateAdminAsync()
        {
            await account.CreateAdmin();
            return Ok();
        }

        [Authorize]  // Require authentication for users with roles
        [HttpPost("identity/users-with-roles")]
        public async Task<ActionResult<IEnumerable<GeneralResponse>>> GetUserWithRoles() =>
            Ok(await account.GetUsersWithRolesResponseAsync());

        [Authorize]  // Require authentication for change user role
        [HttpPost("identity/change-role")]
        public async Task<ActionResult<GeneralResponse>> ChangeUserRole(
            ChangeUserRoleRequest model
        ) => Ok(await account.ChangeUserRoleRequestAsync(model));

        [HttpPost("identity/logout")]
        public async Task<ActionResult<GeneralResponse>> Logout()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new GeneralResponse(message: "User not found"));
            }

            // Clear refresh token from the database
            await account.InvalidateRefreshTokenAsync(userId);

            return Ok(new GeneralResponse(message: "Logged out successfully"));
        }

        [HttpGet("identity/validate")]
        public async Task<ActionResult<UserDTO>> ValidateToken()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new GeneralResponse(message: "Invalid token"));
            }

            var user = await account.GetUserByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized(new GeneralResponse(message: "User not found"));
            }

            return Ok(new UserDTO
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                DepartmentId = user.DepartmentId
            });
        }
    }
}
