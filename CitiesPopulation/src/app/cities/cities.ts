import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PopulationService } from '../services/population.service';
import { CityPopulation } from '../models/city-population.model';

// Define a type for the different views
type View = 'search' | 'add_update' | 'all';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cities.html',
  styleUrl: './cities.css',
  providers: [PopulationService]
})
export class Cities implements OnInit {
  searchTerm: string = '';
  cities: CityPopulation | null = null;
  loading: boolean = false;
  error: string | null = null;
  searched: boolean = false;

  // For Add/Update functionality
  newCity: CityPopulation = { city: '', country: '', year: 0, population: 0 };
  isEditMode: boolean = false;
  originalCityKey: { city: string, country: string, year: number } | null = null; // To store original key for updates

  // For displaying all cities
  allCities: CityPopulation[] = [];
  allCitiesLoading: boolean = false;
  allCitiesError: string | null = null;

  // Current view state for navigation
  currentView: View = 'search'; // Default view

  // For delete confirmation dialog
  showDeleteConfirmDialog: boolean = false;
  cityToDelete: CityPopulation | null = null;

  constructor(private populationService: PopulationService) {}

  ngOnInit(): void {
    this.getAllCities(); // Load all cities when the component initializes
  }

  // Method to switch views
  setView(view: View): void {
    this.currentView = view;
    // Clear previous search results and errors when switching views
    this.searchTerm = '';
    this.cities = null;
    this.error = null;
    this.searched = false;
    this.resetForm(); // Also reset add/update form
    this.cancelDeleteConfirm(); // Ensure dialog is closed when switching views
    if (view === 'all') {
      this.getAllCities(); // Refresh all cities when navigating back to this view
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.error = 'Please enter a city name';
      return;
    }
    const trimmedSearchTerm = this.searchTerm.trim();
    this.loading = true;
    this.error = null;
    this.cities = null;
    this.searched = true;
    console.log('Searching for:', this.searchTerm);
    this.populationService.searchCityPopulation(this.searchTerm)
      .subscribe({
        next: (results) => {
          this.cities = results.length > 0 ? results[0] : null;
          this.loading = false;
          console.log('Search results:', results);
          if (results.length === 0) {
            this.error = `No exact match found for "${this.searchTerm}". Please check the spelling and try again.`;
          }
        },
        error: (error) => {
          this.error = error.message;
          this.cities = null;
          this.loading = false;
          console.error('Search error:', error);
        }
      });
  }

  hasResult(): boolean {
    return this.cities !== null && !this.loading && !this.error;
  }

  shouldShowNoResults(): boolean {
    return this.cities === null && !this.loading && !this.error && this.searched;
  }

  // --- CRUD Operations ---

  getAllCities(): void {
    this.allCitiesLoading = true;
    this.allCitiesError = null;
    console.log('Fetching all cities...');
    this.populationService.getAllCities().subscribe({
      next: (cities) => {
        this.allCities = cities;
        this.allCitiesLoading = false;
        console.log('All cities fetched successfully. Current cities:', this.allCities);
      },
      error: (error) => {
        this.allCitiesError = error.message;
        this.allCitiesLoading = false;
        console.error('Error fetching all cities:', error);
      }
    });
  }

  onAddUpdate(): void {
    this.loading = true;
    this.error = null; // Clear general error

    // Clear add/update form specific error
    this.allCitiesError = null; 

    if (!this.newCity.city || !this.newCity.country || this.newCity.year === 0 || this.newCity.population === 0) {
      this.error = 'All fields (City, Country, Year, Population) are required.';
      this.loading = false;
      return;
    }

    if (this.isEditMode && this.originalCityKey) {
      // Update existing city
      this.populationService.updateCityPopulation(this.newCity).subscribe({
        next: () => {
          console.log('City updated successfully');
          this.resetForm();
          this.getAllCities(); // Refresh the list
          this.loading = false;
          this.setView('all'); // Navigate to all cities view after update
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.error('Error updating city:', error);
        }
      });
    } else {
      // Add new city
      this.populationService.addCityPopulation(this.newCity).subscribe({
        next: () => {
          console.log('City added successfully');
          this.resetForm();
          this.getAllCities(); // Refresh the list
          this.loading = false;
          this.setView('all'); // Navigate to all cities view after add
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.error('Error adding city:', error);
        }
      });
    }
  }

  editCity(city: CityPopulation): void {
    this.setView('add_update'); // Switch to add/update view
    this.isEditMode = true;
    // Create a copy to avoid direct mutation of the table data
    this.newCity = { ...city }; 
    // Store the original key for update operation
    this.originalCityKey = { city: city.city, country: city.country, year: city.year };
  }

  cancelEdit(): void {
    this.resetForm();
    this.setView('all'); // Go back to all cities view
  }

  // Initiates the delete confirmation dialog
  deleteCity(city: CityPopulation): void {
    this.cityToDelete = city;
    this.showDeleteConfirmDialog = true;
  }

  // Confirms and proceeds with the delete action
  confirmDeleteAction(): void {
    if (!this.cityToDelete) {
      console.warn('No city selected for deletion.');
      return;
    }

    const cityInfo = `${this.cityToDelete.city}, ${this.cityToDelete.country} (${this.cityToDelete.year})`;
    console.log(`Attempting to delete: ${cityInfo}`);

    this.loading = true;
    this.error = null;
    this.populationService.deleteCityPopulation(this.cityToDelete.city, this.cityToDelete.country, this.cityToDelete.year).subscribe({
      next: () => {
        console.log(`Successfully deleted ${cityInfo}.`);
        this.getAllCities(); // Refresh the list
        this.loading = false;
        this.cancelDeleteConfirm(); // Close dialog immediately
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error(`Error deleting ${cityInfo}:`, error);
        this.cancelDeleteConfirm(); // Close dialog even on error
      }
    });
  }

  // Cancels the delete confirmation
  cancelDeleteConfirm(): void {
    this.showDeleteConfirmDialog = false;
    this.cityToDelete = null;
  }

  private resetForm(): void {
    this.newCity = { city: '', country: '', year: 0, population: 0 };
    this.isEditMode = false;
    this.originalCityKey = null;
    this.error = null; // Clear any form-related errors
  }
}
