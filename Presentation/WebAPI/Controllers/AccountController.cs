using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;
using Application.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(IAccount account) : ControllerBase
    {
        [HttpPost("identity/create")]
        public async Task<ActionResult<GeneralResponse>> CreateAccount(CreateAccountDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.CreateAccountAsync(model));
        }

        [HttpPost("identity/login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.LoginAsync(model));
        }

        [HttpPost("identity/refresh-token")]
        public async Task<ActionResult<GeneralResponse>> RefreshToken(RefreshTokenDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.RefreshTokenAsync(model));
        }

        [HttpPost("identity/role/create")]
        public async Task<ActionResult<GeneralResponse>> CreateRole(CreateRoleDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.CreateRoleAsync(model));
        }

        [HttpPost("identity/role/list")]
        public async Task<ActionResult<IEnumerable<GetRoleDTO>>> GetRoles() =>
            Ok(await account.GetRoleAsync());

        [HttpPost("identity/admin/create")]
        public async Task<IActionResult> CreateAdminAsync()
        {
            await account.CreateAdmin();
            return Ok();
        }

        [HttpPost("identity/users-with-roles")]
        public async Task<ActionResult<IEnumerable<GeneralResponse>>> GetUserWithRoles() =>
            Ok(await account.GetUsersWithRolesResponseAsync());

        [HttpPost("identity/change-role")]
        public async Task<ActionResult<GeneralResponse>> ChangeUserRole(
            ChangeUserRoleRequest model
        ) => Ok(await account.ChangeUserRoleRequestAsync(model));
    }
}
