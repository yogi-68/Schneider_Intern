import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PopulationService } from '../services/population.service';
import { CityPopulation } from '../models/city-population.model';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cities.html',
  styleUrl: './cities.css',
  providers: [PopulationService]
})
export class Cities {
  searchTerm: string = '';
  cities: CityPopulation[] = [];
  loading: boolean = false;
  error: string | null = null;
  searched: boolean = false;

  constructor(private populationService: PopulationService) {}

  onSearch() {
     if (!this.searchTerm.trim()) {
      this.error = 'Please enter a city name';
      return;
    }
    this.loading = true;
    this.error = null;
    this.cities = [];
    this.searched = true;
    console.log('Searching for:', this.searchTerm);
    this.populationService.searchCityPopulation(this.searchTerm)
      .subscribe({
        next: (results) => {
          this.cities = results;
          this.loading = false;
          console.log('Search results:', results);
        },
        error: (error) => {
          this.error = error.message;
          this.cities = [];
          this.loading = false;
          console.error('Search error:', error);
        }
      });
  }

  clearSearch() {
    this.searchTerm = '';
    this.cities = [];
    this.error = null;
    this.searched = false;
  }

  formatPopulation(population: number): string {
    return population.toLocaleString();
  }
}
