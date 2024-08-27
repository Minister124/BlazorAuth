using System;

namespace Application.DTOs.Request.Account;

public record ChangeUserRoleRequest(string userEmail, string RoleName);
