using System;

namespace Application.DTOs.Response.Account;

public record UserClaimsDTO(
    string Fullname = null!,
    string UserName = null!,
    string Email = null!,
    string Role = null!
);
