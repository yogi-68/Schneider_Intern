using Microsoft.AspNetCore.Mvc;
using PopulationAPI.Models;
using PopulationAPI.Services;

namespace PopulationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PopulationController : ControllerBase
    {
        private readonly IDatabaseService _databaseService;
        private readonly ILogger<PopulationController> _logger;

        public PopulationController(IDatabaseService databaseService, ILogger<PopulationController> logger)
        {
            _databaseService = databaseService;
            _logger = logger;
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<CityPopulation>>> GetAllCities()
        {
            try
            {
                var results = await _databaseService.GetAllCitiesAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all cities");
                return StatusCode(500, "Internal server error occurred");
            }
        }

        [HttpGet("city/{cityName}")]
        public async Task<ActionResult<List<CityPopulation>>> GetCityPopulation(string cityName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cityName))
                {
                    return BadRequest("City name cannot be empty");
                }

                var results = await _databaseService.GetCityPopulationAsync(cityName);
                
                if (!results.Any())
                {
                    return NotFound($"No population data found for city: {cityName}");
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving population data for city: {cityName}");
                return StatusCode(500, "Internal server error occurred");
            }
        }

        [HttpPost("search")]
        public async Task<ActionResult<List<CityPopulation>>> SearchCity([FromBody] CityRequest request)
        {
            try
            {
                if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.CityName))
                {
                    return BadRequest("City name is required");
                }

                var results = await _databaseService.GetCityPopulationAsync(request.CityName);
                
                return Ok(results); // Return empty list instead of 404 for no results
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching population data for city: {request.CityName}");
                return StatusCode(500, "Internal server error occurred");
            }
        }

        [HttpGet("initialize-db")]
        public async Task<ActionResult> InitializeDatabase()
        {
            try
            {
                await _databaseService.InitializeDatabaseAsync();
                return Ok("Database initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing database");
                return StatusCode(500, "Error initializing database");
            }
        }

        [HttpGet("countries")]
        public async Task<ActionResult<List<string>>> GetAllCountries()
        {
            try
            {
                var countries = await _databaseService.GetAllCountriesAsync();
                return Ok(countries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving countries");
                return StatusCode(500, "Internal server error occurred");
            }
        }

        [HttpGet("country/{countryName}")]
        public async Task<ActionResult<List<CityPopulation>>> GetCitiesByCountry(string countryName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(countryName))
                {
                    return BadRequest("Country name cannot be empty");
                }

                var results = await _databaseService.GetCitiesByCountryAsync(countryName);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving cities for country: {countryName}");
                return StatusCode(500, "Internal server error occurred");
            }
        }

        // New API endpoint to add a city population record
        [HttpPost("add")]
        public async Task<ActionResult> AddCityPopulation([FromBody] CityPopulation cityPopulation)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                await _databaseService.AddCityPopulationAsync(cityPopulation);
                return StatusCode(201, "City population added successfully"); // 201 Created
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Attempted to add duplicate city population record.");
                return Conflict(ex.Message); // 409 Conflict
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding city population");
                return StatusCode(500, "Internal server error occurred while adding city population");
            }
        }

        // New API endpoint to update a city population record
        [HttpPut("update")]
        public async Task<ActionResult> UpdateCityPopulation([FromBody] CityPopulation cityPopulation)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                await _databaseService.UpdateCityPopulationAsync(cityPopulation);
                return Ok("City population updated successfully"); // 200 OK
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Attempted to update non-existent city population record.");
                return NotFound(ex.Message); // 404 Not Found
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating city population");
                return StatusCode(500, "Internal server error occurred while updating city population");
            }
        }

        // New API endpoint to delete a city population record
        [HttpDelete("delete/{city}/{country}/{year}")]
        public async Task<ActionResult> DeleteCityPopulation(string city, string country, int year)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(city) || string.IsNullOrWhiteSpace(country) || year == 0)
                {
                    return BadRequest("City, Country, and Year are required for deletion.");
                }
                await _databaseService.DeleteCityPopulationAsync(city, country, year);
                return Ok("City population deleted successfully"); // 200 OK
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Attempted to delete non-existent city population record.");
                return NotFound(ex.Message); // 404 Not Found
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting city population");
                return StatusCode(500, "Internal server error occurred while deleting city population");
            }
        }
    }
}
