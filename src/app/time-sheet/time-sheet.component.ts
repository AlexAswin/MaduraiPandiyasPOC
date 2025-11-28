import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';


interface Employee {
  name: string;
  dailyHours: number[];
  // hourlyRate: number;
}

@Component({
  selector: 'app-time-sheet',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NavBarComponent ],
  templateUrl: './time-sheet.component.html',
  styleUrl: './time-sheet.component.css'
})
export class TimeSheetComponent implements OnInit{
  employees: Employee[] = [];
  days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  newEmployeeName: string = '';

  hourlyRate: number = 15;

  totalAllHours = 0;
  totalAllPay = 0;

  dateFrom: string = '';
  dateTo: string = '';

  ngOnInit(): void {
    this.loadEmployees();
    this.calculateAllTotals();
    this.getThisWeekRange();
  }

  getTotalPay(emp: Employee): number {
    const totalHours = this.getTotalHours(emp);
    const regularHours = Math.min(totalHours, 40);
    return (regularHours * this.hourlyRate);
  }

  getTotalHours(emp: Employee): number {
    return emp.dailyHours.reduce((sum, hours) => sum + hours, 0);
  }

  addEmployee() {
    const name = this.newEmployeeName.trim();
    if (!name) return;

    this.employees.push({
      name,
      dailyHours: [0,0,0,0,0,0,0], 
              
    });

    this.newEmployeeName = '';

    this.saveEmployees();
  }

  saveEmployees() {
    // const employeeTimeSheetDetails = [...this.employees, ...this.dateFrom, ...this.dateTo]
    localStorage.setItem('employees-timeSheet', JSON.stringify(this.employees));
  }

  loadEmployees() {
    const savedEmployees = localStorage.getItem('employees-timeSheet');
    if (savedEmployees) {
      this.employees = JSON.parse(savedEmployees);
    }
  }

  updateShift() {
    this.saveEmployees();
    this.calculateAllTotals();
  }

  getEmployeeTotal(emp: Employee): number {
    return emp.dailyHours.reduce((sum, h) => sum + h, 0);
  }

  getEmployeePay(emp: Employee): number {
    return this.getEmployeeTotal(emp) * this.hourlyRate;
  }

  calculateAllTotals() {
    this.totalAllHours = this.employees.reduce(
      (sum, emp) => sum + this.getEmployeeTotal(emp), 0
    );

    this.totalAllPay = this.totalAllHours * this.hourlyRate;
  }

  deleteEmployee(index: number) {
    // Remove the employee from the array
    this.employees.splice(index, 1);
  
    // Update localStorage
    this.saveEmployees();
  
    // Recalculate totals
    this.calculateAllTotals();
  }


  resetAll() {
    this.employees.forEach(emp => {
      emp.dailyHours = [0, 0, 0, 0, 0, 0, 0];
    });
  
    this.saveEmployees();
    this.calculateAllTotals();
  }

  updateHourlyRate(value: any) {
    this.hourlyRate = value;
  }

  getThisWeekRange() {
    const today = new Date();
  
    const start = new Date(today);
    const end = new Date(today);
  
    const day = today.getDay();
  
    const isoDay = day === 0 ? 7 : day;
  
    start.setDate(today.getDate() - (isoDay - 1));
    end.setDate(start.getDate() + 6);
  
      this.dateFrom = start.toISOString().slice(0, 10),
      this.dateTo = end.toISOString().slice(0, 10)

  }
}