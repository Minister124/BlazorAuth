using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Request.Account;

public class EmailAddressAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var email = value as string;
        if (email == null)
            return new ValidationResult("Email address is required.");

        // Basic checks
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@') || !email.Contains('.'))
            return new ValidationResult("Not a valid email address.");

        var parts = email.Split('@');
        if (parts.Length != 2)
            return new ValidationResult("Not a valid email address.");

        var localPart = parts[0];
        var domainPart = parts[1];

        if (string.IsNullOrWhiteSpace(localPart) || string.IsNullOrWhiteSpace(domainPart))
            return new ValidationResult("Not a valid email address.");

        if (!domainPart.Contains('.'))
            return new ValidationResult("Not a valid email address.");

        var domainParts = domainPart.Split('.');
        if (domainParts.Any(dp => string.IsNullOrWhiteSpace(dp)))
            return new ValidationResult("Not a valid email address.");

        return ValidationResult.Success;
    }
}
