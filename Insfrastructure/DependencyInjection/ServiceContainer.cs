using Domain.Entity.Authentication;
using Insfrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Insfrastructure.DependencyInjection;

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
            .AddIdentityCore<AppDbContext>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager();

        // Return the updated IServiceCollection
        return services;
    }
}
