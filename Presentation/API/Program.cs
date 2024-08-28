using dotenv.net;

using Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

DotEnv.Load();

// Add user secrets configuration in development mode
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Log configuration values
var connectionString = builder.Configuration.GetConnectionString("Kushal");
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Logging.ClearProviders();
builder.Logging.AddConsole(); // Ensure logging is added

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructureService(builder.Configuration);

var app = builder.Build();

app.Logger.LogInformation($"ConnectionString: {connectionString}");
app.Logger.LogInformation($"JwtKey: {jwtKey}");
app.Logger.LogInformation($"JwtIssuer: {jwtIssuer}");
app.Logger.LogInformation($"JwtAudience: {jwtAudience}");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
