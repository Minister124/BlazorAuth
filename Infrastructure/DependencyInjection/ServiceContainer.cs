using System.Text;
using Domain.Entity.Authentication;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.DependencyInjection;

public static class ServiceContainer
{
    public static IServiceCollection AddInfrastructureService(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        // Register AppDbContext with SQL Server connection
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(config.GetConnectionString("Kushal"))
        );

        // Register ASP.NET Core Identity services
        services
            .AddIdentityCore<ApplicationUser>() //specify the user type
            .AddRoles<IdentityRole>() //Add support for Roles
            .AddEntityFrameworkStores<AppDbContext>() // Use AppDbContext for storing Identity data
            .AddSignInManager(); // Add SignInManager for handling sign-ins

        //Register JWT Authentication
        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true, // Validate the issuer of the token. Ensures the token was issued by a trusted issuer.
                    ValidateAudience = true, // Validate the audience of the token. Ensures the token is intended for your application.
                    ValidateIssuerSigningKey = true, // Validate the signing key. Ensures the token was signed with a valid key.
                    ValidateLifetime = true, // Validate the token's expiration.  Ensures the token hasn't expired.
                    ValidIssuer = config["Jwt:Issuer"], // Set the valid issuer from configuration. The expected issuer, retrieved from configuration (appsettings.json).
                    ValidAudience = config["Jwt:Audience"], // Set the valid audience from configuration
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(config["Jwt:Key"]!)
                    ), // Set the signing key. The key used to sign the token, converted from a string to a symmetric security key.
                };
            });
        services.AddAuthentication();
        services.AddAuthorization();
        services.AddCors(o =>
        {
            o.AddPolicy(
                "Client.UI",
                builder =>
                    builder
                        .WithOrigins("https://localhost:7284")
                        .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
            );
        });

        // Return the updated IServiceCollection
        return services;
    }
}
