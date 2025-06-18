using PopulationAPI.Models;

namespace PopulationAPI.Services
{
    public interface IExcelService
    {
        Task LoadExcelDataAsync();
        Task<List<CityPopulation>> GetCityPopulationAsync(string cityName);
    }
}