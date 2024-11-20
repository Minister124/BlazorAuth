using System;

namespace Application.DTOs.Response
{
    public record GeneralResponse(bool flag = false, string message = null!);
}
