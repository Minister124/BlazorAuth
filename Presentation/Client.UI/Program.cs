using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Client.UI;
using MudBlazor.Services;
using MudBlazor;
using Application.DependencyInjection;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
builder.Services.AddApplicationService();
builder.Services.AddMudServices();
builder.Services.AddScoped<MudAlert>();

await builder.Build().RunAsync();
