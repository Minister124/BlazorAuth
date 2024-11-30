using System;
using Application.DTOs.Response.Account;

namespace Application.DTOs.Response
{
    public class LoginResponse
    {
        public UserDTO User { get; set; } = null!;
        public string Token { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }

    public class UserDTO
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string? DepartmentId { get; set; }
    }
}
