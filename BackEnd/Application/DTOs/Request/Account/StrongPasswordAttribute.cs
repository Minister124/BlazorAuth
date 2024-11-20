using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Request.Account;

public class StrongPasswordAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var password = value as string;
        if (password == null)
            return new ValidationResult("Password is required.");

        if (password.Length < 8)
            return new ValidationResult("Password must be at least 8 characters long.");

        if (!password.Any(char.IsUpper))
            return new ValidationResult("Password must contain at least one uppercase letter.");

        if (!password.Any(char.IsLower))
            return new ValidationResult("Password must contain at least one lowercase letter.");

        if (!password.Any(char.IsDigit))
            return new ValidationResult("Password must contain at least one digit.");

        if (!password.Any(ch => "!@#$%^&*-".Contains(ch)))
            return new ValidationResult("Password must contain at least one special character.");

        return ValidationResult.Success;
    }
}
