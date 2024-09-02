using System.Text;
using Application.IRepository;
using Domain.Entity.Authentication;
using Infrastructure.Data;
using Infrastructure.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.DependencyInjection;

public static class ServiceContainer
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        //Register AppDbContext with Sql Server
        services.AddDbContext<AppDbContext>(o =>
            o.UseSqlServer(configuration.GetConnectionString("Kushal"))
        );

        //Register Identity Services
        services
            .AddIdentityCore<ApplicationUser>() //To specify the user type
            .AddRoles<IdentityRole>() //To add support for Roles
            .AddEntityFrameworkStores<AppDbContext>() //stores All Identity Data to AppDbContext
            .AddSignInManager(); //For login in and login out

        //Register JWT Authentication
        services
            .AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(o =>
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true, // Validate the issuer of the token. Ensures the token was issued by a trusted issuer.
                    ValidateAudience = true, // Validate the audience of the token. Ensures the token is intended for your application.
                    ValidateIssuerSigningKey = true, // Validate the signing key. Ensures the token was signed with a valid key.
                    ValidateLifetime = true, // Validate the token's expiration.  Ensures the token hasn't expired.
                    ValidIssuer = configuration["Jwt:Issuer"], // Set the valid issuer from configuration. The expected issuer, retrieved from configuration (appsettings.json).
                    ValidAudience = configuration["Jwt:Audience"], // Set the valid audience from configuration
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)
                    ), // Set the signing key. The key used to sign the token, converted from a string to a symmetric security key.
                }
            );
        services.AddAuthentication();
        services.AddAuthorization();
        services.AddCors(c =>
        {
            c.AddPolicy(
                "Client.UI",
                policy =>
                    policy
                        .WithOrigins("http://localhost:5141")
                        .AllowAnyOrigin()
                        .AllowCredentials()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
            );
        });
        services.AddScoped<IAccount, AccountRepository>();
        return services;
    }
}
