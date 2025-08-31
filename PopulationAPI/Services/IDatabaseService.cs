using PopulationAPI.Models;

namespace PopulationAPI.Services
{
    public interface IDatabaseService
    {
        Task<List<CityPopulation>> GetCityPopulationAsync(string cityName);
        Task<List<CityPopulation>> GetAllCitiesAsync();
        Task<List<string>> GetAllCountriesAsync();
        Task<List<CityPopulation>> GetCitiesByCountryAsync(string countryName);
        Task InitializeDatabaseAsync();
        Task AddCityPopulationAsync(CityPopulation cityPopulation); // New
        Task UpdateCityPopulationAsync(CityPopulation cityPopulation); // New
        Task DeleteCityPopulationAsync(string city, string country, int year); // New
    }
}
