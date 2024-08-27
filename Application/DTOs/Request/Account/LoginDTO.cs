using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Request.Account;

public class LoginDTO
{
    [EmailAddress(ErrorMessage ="Not a Valid Email Address"), Required, DataType(DataType.EmailAddress)]
    // [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Not a Valid Email Address")]
    [Display(Name = "Email Address")]
    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    // [RegularExpression(
    //     "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$",
    //     ErrorMessage = "Password must be a mix of Alphanumeric and special characters"
    // )]
    [StrongPassword(ErrorMessage = "Password must be mix of Alphanumeric and special characters")]
    public string Password { get; set; } = string.Empty;
}
