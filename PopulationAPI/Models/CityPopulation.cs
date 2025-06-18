using System.ComponentModel.DataAnnotations;

namespace PopulationAPI.Models
{
    public class CityPopulation
    {
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int Year { get; set; }
        public long Population { get; set; }
    }

    public class CityRequest
    {
        [Required]
        public string CityName { get; set; } = string.Empty;
    }
}