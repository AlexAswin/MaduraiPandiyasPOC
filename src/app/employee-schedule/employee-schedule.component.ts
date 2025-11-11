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
  const savedEmployees = localStorage.getItem('employees');
  this.employees = savedEmployees ? JSON.parse(savedEmployees) : [];

  const savedShifts = localStorage.getItem('shifts');
  this.shifts = savedShifts ? JSON.parse(savedShifts) : ['11-5', '12-Close', '5-Close'];

  const savedSchedule = localStorage.getItem('schedule');
  this.schedule = savedSchedule ? JSON.parse(savedSchedule) : {};

  // Build schedule & CDK drop lists if schedule not saved
  this.allDropListIds = ['shiftList'];

  this.employees.forEach(emp => {
    if (!this.schedule[emp]) this.schedule[emp] = {}; // Keep saved schedule if exists
    this.days.forEach(day => {
      if (!this.schedule[emp][day]) this.schedule[emp][day] = [];
      this.allDropListIds.push(day + emp);
    });
  });

  this.connectedDropLists = this.allDropListIds.filter(id => id !== 'shiftList');
}

drop(event: CdkDragDrop<string[]>) {
  if (event.previousContainer.id === 'shiftList') {
    const shift = event.previousContainer.data[event.previousIndex];
    event.container.data.push(shift);
  } else if (event.previousContainer !== event.container) {
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
  
    this.employees = this.employees.filter(emp => emp !== name);
    delete this.schedule[name];
  
    this.allDropListIds = this.allDropListIds.filter(id => !id.endsWith(name));
    this.connectedDropLists = this.allDropListIds.filter(id => id !== 'shiftList');
  
    // ✅ Save updates
    localStorage.setItem('employees', JSON.stringify(this.employees));
    localStorage.setItem('schedule', JSON.stringify(this.schedule));
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

  removeShift(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.shifts.splice(index, 1);
    localStorage.setItem('shifts', JSON.stringify(this.shifts)); // Save update
  }
  
  

  resetSchedule() {
    if (!confirm("⚠️ Reset everything? This will clear ALL saved schedule data.")) return;

    this.employees.forEach(emp => {
      this.schedule[emp] = {};
      this.days.forEach(day => {
        this.schedule[emp][day] = [];  
      });
    });

    localStorage.removeItem('schedule');
  }
  
  
  

  saveSchedule() {
    localStorage.setItem('schedule', JSON.stringify(this.schedule));
    alert("✅ Schedule Saved Successfully!");
  }
  
  
  
  
  
  
}
