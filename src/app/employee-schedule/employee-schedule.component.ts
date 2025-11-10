import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-employee-schedule',
  standalone: true,
  imports: [DragDropModule, NgFor, CommonModule,  FormsModule, NavBarComponent],
  templateUrl: './employee-schedule.component.html',
  styleUrl: './employee-schedule.component.css'
})
export class EmployeeScheduleComponent {
  days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  employees: string[] = [];
  newEmployee = '';

  shifts = ['11-5', '12-Close', '5-Close'];
  newShift = '';

  schedule: any = {};

  allDropListIds: string[] = [];

  connectedDropLists: string[] = [];

constructor() {
  // this.employees.forEach(emp => {
  //   this.schedule[emp] = {};
  //   this.days.forEach(day => {
  //     this.schedule[emp][day] = [];
  //     this.allDropListIds.push(day + emp); // add cell ID
  //   });
  // });
  // this.allDropListIds.push('shiftList');
  // this.connectedDropLists = this.allDropListIds.filter(id => id !== 'shiftList');
}


ngOnInit() {
  // const saved = localStorage.getItem('employees');
  // this.employees = saved ? JSON.parse(saved) : [];
  // console.log(this.employees)

  const saved = localStorage.getItem('employees');
  this.employees = saved ? JSON.parse(saved) : [];

  // Initialize schedule and drop lists
  this.allDropListIds = ['shiftList'];
  this.schedule = {};

  this.employees.forEach(emp => {
    this.schedule[emp] = {};
    this.days.forEach(day => {
      this.schedule[emp][day] = [];
      this.allDropListIds.push(day + emp);
    });
  });

  this.connectedDropLists = this.allDropListIds.filter(id => id !== 'shiftList');


  const savedShifts = localStorage.getItem('shifts');
  this.shifts = savedShifts ? JSON.parse(savedShifts) : ['11-5', '12-Close', '5-Close'];
}

  drop(event: CdkDragDrop<string[]>) {
    // Dragging from the original shift list -> clone
    if (event.previousContainer.id === 'shiftList') {
      const shift = event.previousContainer.data[event.previousIndex];
      event.container.data.push(shift); // clone
    }

    else if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  addEmployee() {
    const name = this.newEmployee.trim();
    if (!name) return;
  
    if (this.employees.includes(name)) {
      alert("Employee already exists!");
      return;
    }
  
    this.employees.push(name);
  
    // Initialize schedule
    this.schedule[name] = {};
    this.days.forEach(day => {
      this.schedule[name][day] = [];
      this.allDropListIds.push(day + name);
    });
  
    // Update connected lists
    this.connectedDropLists = this.allDropListIds.filter(id => id !== 'shiftList');
  
    // Save to localStorage
    localStorage.setItem('employees', JSON.stringify(this.employees));
  
    this.newEmployee = '';
  }

  deleteEmployee(name: string) {
    if (!confirm(`Delete ${name}?`)) return;
  
    // Remove from employees list
    this.employees = this.employees.filter(emp => emp !== name);
  
    // Remove from schedule object
    delete this.schedule[name];
  
    // Remove related dropList IDs
    this.allDropListIds = this.allDropListIds.filter(id => !id.endsWith(name));
  
    // Update connected lists
    this.connectedDropLists = this.allDropListIds.filter(id => id !== 'shiftList');
  
    // Update localStorage
    localStorage.setItem('employees', JSON.stringify(this.employees));
  }
  
  addShift() {
    const shift = this.newShift.trim();
    if (!shift) return;
  
    if (this.shifts.includes(shift)) {
      alert("Shift already exists!");
      return;
    }
  
    this.shifts.push(shift);
    localStorage.setItem('shifts', JSON.stringify(this.shifts)); // ✅ Save
    this.newShift = '';
  }
  
  
  
}
