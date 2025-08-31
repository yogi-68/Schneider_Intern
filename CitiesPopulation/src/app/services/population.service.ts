import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CityPopulation } from '../models/city-population.model';

@Injectable({
  providedIn: 'root'
})
export class PopulationService {
  private apiUrl = 'http://localhost:5000/api/population';

  constructor(private http: HttpClient) { }

  searchCityPopulation(cityName: string): Observable<CityPopulation[]> {
    const request = { cityName: cityName.trim() };
    return this.http.post<CityPopulation[]>(`${this.apiUrl}/search`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllCities(): Observable<CityPopulation[]> {
    return this.http.get<CityPopulation[]>(`${this.apiUrl}/all`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllCountries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/countries`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCitiesByCountry(countryName: string): Observable<CityPopulation[]> {
    return this.http.get<CityPopulation[]>(`${this.apiUrl}/country/${encodeURIComponent(countryName)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCityByName(cityName: string): Observable<CityPopulation[]> {
    return this.http.get<CityPopulation[]>(`${this.apiUrl}/city/${encodeURIComponent(cityName)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  initializeDatabase(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/initialize-db`)
      .pipe(
        catchError(this.handleError)
      );
  }

  searchCitiesLocally(cityName: string): Observable<CityPopulation[]> {
    return this.getAllCities().pipe(
      map(cities => cities.filter(city => 
        city.city.toLowerCase().includes(cityName.toLowerCase().trim())
      ))
    );
  }

  // New method to add a city population record
  addCityPopulation(cityPopulation: CityPopulation): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, cityPopulation)
      .pipe(
        catchError(this.handleError)
      );
  }

  // New method to update a city population record
  updateCityPopulation(cityPopulation: CityPopulation): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, cityPopulation)
      .pipe(
        catchError(this.handleError)
      );
  }

  // New method to delete a city population record
  deleteCityPopulation(city: string, country: string, year: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${encodeURIComponent(city)}/${encodeURIComponent(country)}/${year}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check if the backend is running.';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 409: // Conflict for duplicate entry
          errorMessage = error.error; // Backend sends the error message directly
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
