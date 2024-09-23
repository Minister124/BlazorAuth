using Infrastructure.DependencyInjection;


var builder = WebApplication.CreateBuilder(args);


builder.Configuration.AddUserSecrets<Program>();
// Clear existing logging providers and add console logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole(); // For logging to the console (will show in terminal or Output window)

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Client");
app.MapControllers();

app.UseAuthentication();

app.Run();
