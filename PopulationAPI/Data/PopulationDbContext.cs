using Microsoft.EntityFrameworkCore;
using PopulationAPI.Models;

namespace PopulationAPI.Data
{
    public class PopulationDbContext : DbContext
    {
        public PopulationDbContext(DbContextOptions<PopulationDbContext> options) : base(options)
        {
        }

        public DbSet<CityPopulation> CityPopulations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CityPopulation>(entity =>
            {
                entity.ToTable("CityPopulations");
                entity.HasKey(e => new { e.City, e.Country, e.Year });
                entity.Property(e => e.City)
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnName("City");
                entity.Property(e => e.Country)
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnName("Country");
                entity.Property(e => e.Year)
                    .IsRequired()
                    .HasColumnName("Year");
                entity.Property(e => e.Population)
                    .IsRequired()
                    .HasColumnName("Population");
                    
            });
        }
    }
}
