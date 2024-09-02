using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
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
        public async Task<ActionResult<GeneralResponse>> Login(LoginDTO model){
            if(!ModelState.IsValid) return BadRequest("Model Cannot be Null");
            return Ok(await account.LoginAsync(model));
        }
    }
}
