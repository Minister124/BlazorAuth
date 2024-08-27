using System;

namespace Application.DTOs.Request.Account;

public class LocalStorageDTO
{
    public string? Token { get; set;}
    public string? RefreshToken { get; set;}
}
