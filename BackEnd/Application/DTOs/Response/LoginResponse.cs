using System;

namespace Application.DTOs.Response
{
    public record LoginResponse(bool flag= false, string message = null!, string token = null!, string refreshToken = null!);
}
