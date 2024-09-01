using System;

namespace Domain.Entity.Authentication;

public class RefreshToken
{
    public Guid ID { get; set; }

    public string? UserID { get; set; }

    public string? Token { get; set; }
}
