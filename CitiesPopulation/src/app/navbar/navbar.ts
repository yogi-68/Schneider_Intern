import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overview } from '../overview/overview';
import { Cities } from '../cities/cities';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, Overview, Cities],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  activeTab: string = 'overview';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
