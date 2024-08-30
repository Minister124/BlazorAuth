using System;
using Application.DTOs.Response;
using Microsoft.AspNetCore.Identity;

namespace Application.Extensions;

public static class IdentityRoleExtension
{
    public static GeneralResponse ToGeneralResponse(
        this IdentityResult identityResult,
        string successMessage
    )
    {
        if (identityResult.Succeeded)
        {
            return new GeneralResponse(true, successMessage);
        }

        var error = string.Join(",", identityResult.Errors.Select(x => x.Description));
        return new GeneralResponse(false, error);
    }
}
