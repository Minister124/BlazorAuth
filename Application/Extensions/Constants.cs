using System;

namespace Application.Extensions;

public static class Constants
{
    public const string BrowserStorageKey = "x-key";
    public const string HttpClientHeaderScheme = "Bearer";
    public const string HttpClientName = "Client.UI";
    public static class Role
    {
        public const string Admin = "Admin";
        public const string User = "User";
    }
}
