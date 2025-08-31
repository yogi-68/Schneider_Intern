using Microsoft.EntityFrameworkCore;
using PopulationAPI.Data;
using PopulationAPI.Models;

namespace PopulationAPI.Services
{
    public class DatabaseService : IDatabaseService
    {
        private readonly PopulationDbContext _context;
        private readonly ILogger<DatabaseService> _logger;

        public DatabaseService(PopulationDbContext context, ILogger<DatabaseService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<CityPopulation>> GetAllCitiesAsync()
        {
            try
            {
                var cities = await _context.CityPopulations
                    .OrderBy(c => c.City)
                    .ThenBy(c => c.Country)
                    .ThenByDescending(c => c.Year)
                    .ToListAsync();
                
                _logger.LogInformation($"Retrieved {cities.Count} cities from database");
                return cities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all cities from database");
                throw;
            }
        }

        public async Task<List<CityPopulation>> GetCityPopulationAsync(string cityName)
        {
            try
            {
                var exactMatches = await _context.CityPopulations
                    .Where(c => EF.Functions.Like(c.City.ToLower(), cityName.ToLower()))
                    .OrderBy(c => c.City)
                    .ThenBy(c => c.Country)
                    .ThenByDescending(c => c.Year)
                    .ToListAsync();

                _logger.LogInformation($"Found {exactMatches.Count} exact matches for city: {cityName}");
                return exactMatches;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving population data for city: {cityName}");
                throw;
            }
        }

        public async Task InitializeDatabaseAsync()
        {
            try
            {
                await _context.Database.EnsureCreatedAsync();
                _logger.LogInformation("Database initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing database");
                throw;
            }
        }

        public async Task<List<string>> GetAllCountriesAsync()
        {
            try
            {
                var countries = await _context.CityPopulations
                    .Select(c => c.Country)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {countries.Count} unique countries from database");
                return countries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving countries from database");
                throw;
            }
        }

        public async Task<List<CityPopulation>> GetCitiesByCountryAsync(string countryName)
        {
            try
            {
                var cities = await _context.CityPopulations
                    .Where(c => EF.Functions.Like(c.Country.ToLower(), countryName.ToLower()))
                    .OrderBy(c => c.City)
                    .ThenByDescending(c => c.Year)
                    .ToListAsync();

                _logger.LogInformation($"Found {cities.Count} cities for country: {countryName}");
                return cities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving cities for country: {countryName}");
                throw;
            }
        }

        // New method to add a city population record
        public async Task AddCityPopulationAsync(CityPopulation cityPopulation)
        {
            try
            {
                // Check if a record with the same City, Country, and Year already exists
                var existingCity = await _context.CityPopulations
                    .FirstOrDefaultAsync(c => c.City == cityPopulation.City && 
                                              c.Country == cityPopulation.Country && 
                                              c.Year == cityPopulation.Year);

                if (existingCity != null)
                {
                    _logger.LogWarning($"Attempted to add duplicate city population record: {cityPopulation.City}, {cityPopulation.Country}, {cityPopulation.Year}");
                    throw new InvalidOperationException("A record with the same City, Country, and Year already exists.");
                }

                await _context.CityPopulations.AddAsync(cityPopulation);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Added city population: {cityPopulation.City}, {cityPopulation.Country}, {cityPopulation.Year}, {cityPopulation.Population}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding city population: {cityPopulation.City}, {cityPopulation.Country}, {cityPopulation.Year}");
                throw;
            }
        }

        // New method to update a city population record
        public async Task UpdateCityPopulationAsync(CityPopulation cityPopulation)
        {
            try
            {
                var existingCity = await _context.CityPopulations
                    .FirstOrDefaultAsync(c => c.City == cityPopulation.City && 
                                              c.Country == cityPopulation.Country && 
                                              c.Year == cityPopulation.Year);

                if (existingCity == null)
                {
                    _logger.LogWarning($"Attempted to update non-existent city population record: {cityPopulation.City}, {cityPopulation.Country}, {cityPopulation.Year}");
                    throw new KeyNotFoundException("City population record not found for update.");
                }

                existingCity.Population = cityPopulation.Population;
                _context.CityPopulations.Update(existingCity);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Updated city population: {cityPopulation.City}, {cityPopulation.Country}, {cityPopulation.Year} to {cityPopulation.Population}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating city population: {cityPopulation.City}, {cityPopulation.Country}, {cityPopulation.Year}");
                throw;
            }
        }

        // New method to delete a city population record
        public async Task DeleteCityPopulationAsync(string city, string country, int year)
        {
            try
            {
                var cityToDelete = await _context.CityPopulations
                    .FirstOrDefaultAsync(c => c.City == city && 
                                              c.Country == country && 
                                              c.Year == year);

                if (cityToDelete == null)
                {
                    _logger.LogWarning($"Attempted to delete non-existent city population record: {city}, {country}, {year}");
                    throw new KeyNotFoundException("City population record not found for deletion.");
                }

                _context.CityPopulations.Remove(cityToDelete);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Deleted city population: {city}, {country}, {year}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting city population: {city}, {country}, {year}");
                throw;
            }
        }
    }
}
