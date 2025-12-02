import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../schedule.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface Employee {
  name: string;
  dailyHours: number[];
  // hourlyRate: number;
}

@Component({
  selector: 'app-time-sheet',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, NavBarComponent ],
  templateUrl: './time-sheet.component.html',
  styleUrl: './time-sheet.component.css'
})
export class TimeSheetComponent implements OnInit{

  storeId: string | null = null;
  employees: Employee[] = [];
  days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  newEmployeeName: string = '';
  selectedEmployee: Employee | null = null;

  hourlyRate: number = 15;
  totalAllHours = 0;
  totalAllPay = 0;

  dateFrom: string = '';
  dateTo: string = '';

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.storeId = localStorage.getItem('UserId');
    if (!this.storeId) return;

    this.getThisWeekRange();
    this.loadEmployees();
    this.calculateAllTotals();
  }

  getWeekId(): string {
    return this.dateFrom;
  }

  async saveEmployees() {
    if (!this.storeId) return;

    const weekId = this.getWeekId();
    await this.scheduleService.saveTimeSheet(
      this.storeId,
      weekId,
      this.employees,
      this.hourlyRate,
      this.dateFrom,
      this.dateTo
    );
  }

  async loadEmployees() {
    if (!this.storeId) return;

    const weekId = this.getWeekId();
    const data = await this.scheduleService.getTimeSheet(this.storeId, weekId);

    if (data) {
      this.employees = data['employees'] || [];
      this.hourlyRate = data['hourlyRate'] || 15;
      this.dateFrom = data['dateFrom'] || this.dateFrom;
      this.dateTo = data['dateTo'] || this.dateTo;
    }
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
    this.calculateAllTotals();
  }

  updateShift() {
    this.calculateAllTotals();
    this.saveEmployees();
  }

  deleteEmployee(index: number) {
    this.employees.splice(index, 1);
    this.saveEmployees();
    this.calculateAllTotals();
  }

  resetAll() {
    this.employees.forEach(emp => emp.dailyHours = [0,0,0,0,0,0,0]);
    this.saveEmployees();
    this.calculateAllTotals();
  }

  calculateAllTotals(): number {
    this.totalAllHours = this.employees.reduce(
      (sum, emp) => sum + emp.dailyHours.reduce((s, h) => s + h, 0),
      0
    );
    this.totalAllPay = this.totalAllHours * this.hourlyRate;
  
    return this.totalAllHours; // <-- return total hours so template can display
  }

  getEmployeeTotal(emp: Employee): number {
    return emp.dailyHours.reduce((sum, h) => sum + h, 0);
  }
  

  updateHourlyRate(input: HTMLInputElement) {
    const value = Number(input.value);
    if (isNaN(value) || value <= 0) return;
    this.hourlyRate = value;
    this.saveEmployees();
    input.value = '';
  }

  getThisWeekRange() {
    const today = new Date();
    const day = today.getDay() || 7;
    const start = new Date(today);
    start.setDate(today.getDate() - day + 1);
    start.setHours(0,0,0,0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);

    this.dateFrom = start.toISOString().slice(0,10);
    this.dateTo = end.toISOString().slice(0,10);
  }

  downloadEmployeePDF(emp: Employee | null) {

    if (!emp) {
      alert("Please select an employee");
      return;
    }

    const doc = new jsPDF();
    let currentY = 15;
  
    // Add Logo
    const img = new Image();
    img.src = 'assets/Logo/MaduraiPandiyas.jpeg';
  
    img.onload = () => {
      doc.addImage(img, 'JPEG', 155, 10, 40, 30);
  
      // Header
      doc.setFontSize(16);
      doc.text('Weekly Time Sheet', 14, currentY);
      currentY += 10;
  
      doc.setFontSize(12);
      doc.text(`Employee: ${emp.name}`, 14, currentY);
      currentY += 6;
      doc.text(`Hourly Rate: CAD${this.hourlyRate}`, 14, currentY);
      currentY += 6;
      doc.text(`Week: ${this.dateFrom} to ${this.dateTo}`, 14, currentY);
      currentY += 10;
  
      const rows = emp.dailyHours.map((hours, idx) => [this.days[idx], hours]);
      const totalHours = emp.dailyHours.reduce((sum, h) => sum + h, 0);
      const totalPay = totalHours * this.hourlyRate;
  
      rows.push(['Total Hours', totalHours]);
      rows.push(['Total Pay', totalPay.toFixed(2)]);
  
      autoTable(doc, {
        head: [['Day', 'Hours']],
        body: rows,
        startY: currentY,
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10, halign: 'center', cellPadding: 6, },
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
      });
  
      currentY = (doc as any).lastAutoTable.finalY + 10;
  

      doc.setFontSize(10);
      doc.text('Generated by Madurai Pandiyas', 14, 290);
  
      doc.save(`${emp.name}-Weekly-TimeSheet.pdf`);
    };
  
    img.onerror = () => {
      console.error('Logo not found! Make sure the path is correct.');
    };
  }
  
  
}