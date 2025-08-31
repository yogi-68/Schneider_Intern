import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Cities } from './cities';

describe('Cities', () => {
  let component: Cities;
  let fixture: ComponentFixture<Cities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cities, HttpClientTestingModule, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty search term initially', () => {
    expect(component.searchTerm).toBe('');
  });

  it('should set error when searching with empty term', () => {
    component.searchTerm = '';
    component.onSearch();
    expect(component.error).toBe('Please enter a city name');
  });

  it('should clear search results', () => {
    component.searchTerm = 'London';
    component.searched = true;
    
    expect(component.searchTerm).toBe('');
    expect(component.searched).toBe(false);
  });
});
