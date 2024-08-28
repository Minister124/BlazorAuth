using dotenv.net;

using Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

DotEnv.Load();

// Add user secrets configuration in development mode
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

/*var connection = builder.Configuration.GetConnectionString("Kushal");
var key = builder.Configuration["Jwt:Key"];
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];*/

/*builder.Logging.ClearProviders();
builder.Logging.AddConsole();*/

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

/*app.Logger.LogInformation($"Connection string: {connection}");
app.Logger.LogInformation($"Issuer: {issuer}");
app.Logger.LogInformation($"Key: {key}");
app.Logger.LogInformation($"Audience: {audience}");*/

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
