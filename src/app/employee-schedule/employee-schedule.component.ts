import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-schedule',
  standalone: true,
  imports: [DragDropModule, NgFor, CommonModule,  FormsModule, NavBarComponent, RouterModule],
  templateUrl: './employee-schedule.component.html',
  styleUrl: './employee-schedule.component.css'
})
export class EmployeeScheduleComponent implements OnInit {
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  employees: string[] = [];
  newEmployee = '';

  TotalHours: number = 0;
  TotalSalary: number = 0;
  hourlyRate: number = 15;

  schedule: any = {};

  constructor() {}

  ngOnInit() {
    const savedEmployees = localStorage.getItem('employees');
    this.employees = savedEmployees ? JSON.parse(savedEmployees) : [];

    const savedSchedule = localStorage.getItem('schedule');
    this.schedule = savedSchedule ? JSON.parse(savedSchedule) : {};

    this.employees.forEach(emp => {
      if (!this.schedule[emp]) this.schedule[emp] = {};
      this.days.forEach(day => {
        if (!this.schedule[emp][day]) this.schedule[emp][day] = '';
      });
      if (!this.schedule[emp].totalHours) this.schedule[emp].totalHours = 0;
    });

    this.updateTotalHoursAllEmployees();
  }

  // ------------------- Hours Calculation -------------------
  calculateShiftHours(shift: string): number {
    if (!shift) return 0;
  
    const [startStr, endStr] = shift.split('-').map(t => t.trim());
    if (!startStr || !endStr) return 0;
  
    const to24HourMinutes = (time: string): number => {
      // Match formats like "5:00PM", "5PM", "10:30AM"
      const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (!match) return 0;
  
      let hour = parseInt(match[1], 10);
      const minute = match[2] ? parseInt(match[2], 10) : 0;
      const period = match[3]?.toUpperCase();
  
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
  
      // If no AM/PM specified, apply store rules
      if (!period) {
        // 10 <= hour < 17 → AM (morning/afternoon)
        // hour >= 17 or < 10 → PM (evening)
        if (hour < 10 || hour >= 17) hour += 12;
      }
  
      return hour * 60 + minute;
    };
  
    let start = to24HourMinutes(startStr);
    let end = to24HourMinutes(endStr);
  
    // If shift crosses midnight (store closes at 12AM)
    if (end < start) end += 24 * 60;
  
    return (end - start) / 60;
  }
  
  
  

  

  updateTotalHours(emp: string) {
    let total = 0;
    this.days.forEach(day => {
      const shift = this.schedule[emp][day];
      total += this.calculateShiftHours(shift);
    });
    this.schedule[emp].totalHours = total;
    this.updateTotalHoursAllEmployees();
    localStorage.setItem('schedule', JSON.stringify(this.schedule));
  }

  updateTotalHoursAllEmployees() {
    this.TotalHours = this.employees.reduce(
      (sum, emp) => sum + (this.schedule[emp].totalHours || 0),
      0
    );
    this.TotalSalary = this.TotalHours * this.hourlyRate;
  }

  // ------------------- Employees -------------------
  addEmployee() {
    const name = this.newEmployee.trim();
    if (!name || this.employees.includes(name)) return;

    this.employees.push(name);
    this.schedule[name] = {};
    this.days.forEach(day => (this.schedule[name][day] = ''));
    this.schedule[name].totalHours = 0;

    localStorage.setItem('employees', JSON.stringify(this.employees));
    localStorage.setItem('schedule', JSON.stringify(this.schedule));

    this.newEmployee = '';
  }

  deleteEmployee(name: string) {
    this.employees = this.employees.filter(e => e !== name);
    delete this.schedule[name];
    localStorage.setItem('employees', JSON.stringify(this.employees));
    localStorage.setItem('schedule', JSON.stringify(this.schedule));
    this.updateTotalHoursAllEmployees();
  }

  resetSchedule() {
    this.employees.forEach(emp => {
      this.days.forEach(day => (this.schedule[emp][day] = ''));
      this.schedule[emp].totalHours = 0;
    });
    localStorage.removeItem('schedule');
    this.updateTotalHoursAllEmployees();
  }

  saveSchedule() {
    localStorage.setItem('schedule', JSON.stringify(this.schedule));
    alert('Schedule saved successfully!');
  }

  updateHourlyRate(value: any) {
    this.hourlyRate = value;
  }
}
