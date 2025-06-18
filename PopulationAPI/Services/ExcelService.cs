using OfficeOpenXml;
using PopulationAPI.Models;
using PopulationAPI.Services;

namespace PopulationAPI.Services
{
    public class ExcelService : IExcelService
    {
        private readonly ILogger<ExcelService> _logger;
        private readonly string _excelFilePath;
        private List<CityPopulation> _cachedData;

        public ExcelService(ILogger<ExcelService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _excelFilePath = configuration.GetConnectionString("ExcelFilePath") ?? "Data/population_data.xlsx";
            _cachedData = new List<CityPopulation>();
            
            // Set EPPlus license context
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public async Task LoadExcelDataAsync()
        {
            try
            {
                if (!File.Exists(_excelFilePath))
                {
                    _logger.LogError($"Excel file not found at path: {_excelFilePath}");
                    return;
                }

                // Use Task.Run for CPU-intensive Excel processing
                var cityData = await Task.Run(() =>
                {
                    using var package = new ExcelPackage(new FileInfo(_excelFilePath));
                    var worksheet = package.Workbook.Worksheets[0]; // First worksheet
                    
                    if (worksheet.Dimension == null)
                    {
                        _logger.LogWarning("Excel worksheet is empty");
                        return new List<CityPopulation>();
                    }

                    var rowCount = worksheet.Dimension.Rows;
                    var data = new List<CityPopulation>();

                    _logger.LogInformation($"Processing {rowCount} rows from Excel file");

                    // Skip header row, start from row 2
                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            // Adjust these column indices based on your actual Excel structure
                            var city = worksheet.Cells[row, 1].Value?.ToString()?.Trim() ?? "";
                            var country = worksheet.Cells[row, 5].Value?.ToString()?.Trim() ?? ""; // Using your original column 5
                            var populationValue = worksheet.Cells[row, 10].Value; // Using your original column 10
                            var yearValue = worksheet.Cells[row, 11].Value; // Using your original column 11

                            // Skip rows with missing essential data
                            if (string.IsNullOrWhiteSpace(city) || string.IsNullOrWhiteSpace(country))
                            {
                                continue;
                            }

                            long population = 0;
                            int year = 0;

                            // Parse population
                            if (populationValue != null)
                            {
                                var populationStr = populationValue.ToString()?.Replace(",", "").Replace(" ", "") ?? "";
                                if (!long.TryParse(populationStr, out population) || population <= 0)
                                {
                                    continue;
                                }
                            }
                            else
                            {
                                continue;
                            }

                            // Parse year
                            if (yearValue != null)
                            {
                                if (!int.TryParse(yearValue.ToString(), out year) || year < 1800 || year > DateTime.Now.Year)
                                {
                                    continue;
                                }
                            }
                            else
                            {
                                continue;
                            }

                            data.Add(new CityPopulation
                            {
                                City = city,
                                Country = country,
                                Population = population,
                                Year = year
                            });
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning($"Error processing row {row}: {ex.Message}");
                        }
                    }

                    return data;
                });

                _cachedData = cityData;
                _logger.LogInformation($"Successfully loaded {_cachedData.Count} city records from Excel file");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading Excel data");
                throw;
            }
        }

        public async Task<List<CityPopulation>> GetCityPopulationAsync(string cityName)
        {
            if (!_cachedData.Any())
            {
                _logger.LogInformation("Cache is empty, loading Excel data...");
                await LoadExcelDataAsync();
            }

            if (string.IsNullOrWhiteSpace(cityName))
            {
                _logger.LogWarning("GetCityPopulationAsync called with empty city name");
                return new List<CityPopulation>();
            }

            // Use Task.Run for potentially CPU-intensive search operations on large datasets
            var results = await Task.Run(() =>
            {
                return _cachedData
                    .Where(c => c.City.Contains(cityName.Trim(), StringComparison.OrdinalIgnoreCase))
                    .OrderByDescending(c => c.Year)
                    .ThenByDescending(c => c.Population)
                    .ToList();
            });

            _logger.LogInformation($"Found {results.Count} matches for city: '{cityName}'");
            return results;
        }
    }
}