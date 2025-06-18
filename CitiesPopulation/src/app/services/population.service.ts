import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CityPopulation } from '../models/city-population.model';

@Injectable({
  providedIn: 'root'
})
export class PopulationService {
  private apiUrl = 'https://localhost:7071/api/population'; // Update with your actual API URL

  constructor(private http: HttpClient) { }

  searchCityPopulation(cityName: string): Observable<CityPopulation[]> {
    const request = { cityName: cityName.trim() };
    return this.http.post<CityPopulation[]>(`${this.apiUrl}/search`, request)
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
          errorMessage = 'Unable to connect to server. Please check if the API is running.';
          break;
        case 404:
          errorMessage = 'City not found';
          break;
        case 400:
          errorMessage = 'Invalid city name';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}