using System;
using Application.DTOs.Response;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Extensions
{
    public static class IdentityResultExtension
    {
        public static GeneralResponse ToGeneralResponse(
            this IdentityResult identityResult, //use this keyword to not create the static instacne like 
            //IdentityResultExtension.ToGeneralResponse shit. Using this keyword,
            //this method can be called with every object of Idendityresult like object.ToGeneralResponse
            string successMessage
        )
        {
            if (identityResult.Succeeded)
            {
                return new GeneralResponse(true, successMessage);
            }

            var errors = string.Join(",", identityResult.Errors.Select(error => error.Description));
            return new GeneralResponse(false, $"Failed to do operation due to this error: {errors}");
        }
    }
}
