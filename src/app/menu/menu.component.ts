import { KeyValue, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';
import { CommonModule } from '@angular/common';
import { LogInComponent } from '../log-in/log-in.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

interface MenuItem {
  
  Category: string;
  ItemName: string;
  Price: number;
  Availability: string;
}


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [HttpClientModule, NgFor, CommonModule, NavBarComponent, LogInComponent ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent  implements OnInit {

  menuItems: any = [];
  todayDate: any = 0;
  groupedMenuItem: { [category: string]: MenuItem[] } = {};
  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;  // No sorting, preserve original order
  }
  

  private menuItemsURL  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTUlfPw6Rxh8AfTPDEeDjB18OADT3Shz2dZJtHQwcg1xE2ioYiYSN-t9t41eDB7XvXsV3vaKppw-7K-/pub?gid=0&single=true&output=csv';

  constructor( private http: HttpClient) { }
  
  ngOnInit(): void {
  this.getMenuItems();
  this.todayDate = new Date().toLocaleDateString();
  }

  getMenuItems() {
    this.http.get(this.menuItemsURL, { responseType: 'text' }).subscribe(data => {
      const parsed = Papa.parse(data, { header: true });
      this.menuItems = parsed.data;
  
      this.groupedMenuItem = this.menuItems.reduce((groups: { [key: string]: any[] }, item: any) => {
        
        const category = (item.Category ? String(item.Category) : 'Uncategorized').trim();
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      }, {});
  
      console.log(this.groupedMenuItem);
    });  

    const originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
      return 0;
    }
  }

  



}
