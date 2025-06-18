using OfficeOpenXml;
using PopulationAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register your Excel service - use Singleton since it caches data
builder.Services.AddSingleton<IExcelService, ExcelService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Load Excel data on startup
using (var scope = app.Services.CreateScope())
{
    var excelService = scope.ServiceProvider.GetRequiredService<IExcelService>();
    await excelService.LoadExcelDataAsync();
}

app.Run();