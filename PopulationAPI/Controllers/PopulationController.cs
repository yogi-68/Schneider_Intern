using Microsoft.AspNetCore.Mvc;
using PopulationAPI.Models;
using PopulationAPI.Services;

namespace PopulationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PopulationController : ControllerBase
    {
        private readonly IExcelService _excelService;
        private readonly ILogger<PopulationController> _logger;

        public PopulationController(IExcelService excelService, ILogger<PopulationController> logger)
        {
            _excelService = excelService;
            _logger = logger;
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

                var results = await _excelService.GetCityPopulationAsync(cityName);
                
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
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var results = await _excelService.GetCityPopulationAsync(request.CityName);
                
                if (!results.Any())
                {
                    return NotFound($"No population data found for city: {request.CityName}");
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching population data for city: {request.CityName}");
                return StatusCode(500, "Internal server error occurred");
            }
        }

        [HttpGet("reload-data")]
        public async Task<ActionResult> ReloadData()
        {
            try
            {
                await _excelService.LoadExcelDataAsync();
                return Ok("Data reloaded successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reloading Excel data");
                return StatusCode(500, "Error reloading data");
            }
        }
    }
}