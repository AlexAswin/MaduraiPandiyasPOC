import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../schedule.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

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
  storeId: string | null = null;

  schedule: { [employee: string]: { [day: string]: string | number, totalHours: number } } = {};

  constructor(private scheduleService: ScheduleService) {}

  async ngOnInit() {
    this.storeId = localStorage.getItem('UserId');
    if (!this.storeId) return;

    await this.getWeeklySchedule();
    this.initializeScheduleDefaults();
    this.updateTotalHoursAllEmployees();
  }


  addEmployee() {
    const name = this.newEmployee.trim();
    if (!name || this.employees.includes(name)) return;

    this.employees.push(name);
    this.schedule[name] = {totalHours: 0};
    this.days.forEach(day => (this.schedule[name][day] = ''));
    this.schedule[name].totalHours = 0;

    this.saveScheduleToDB();
    this.newEmployee = '';
  }

  deleteEmployee(name: string) {
    this.employees = this.employees.filter(e => e !== name);
    delete this.schedule[name];
    this.updateTotalHoursAllEmployees();
    this.saveScheduleToDB();
  }

  updateHourlyRate(input: HTMLInputElement) {
    const value = Number(input.value);
    if (isNaN(value) || value <= 0) return;
    this.hourlyRate = value;
    this.updateTotalHoursAllEmployees();
    this.saveScheduleToDB();
    input.value = '';
  }

  resetSchedule() {
    this.employees.forEach(emp => {
      this.days.forEach(day => (this.schedule[emp][day] = ''));
      this.schedule[emp].totalHours = 0;
    });
    this.updateTotalHoursAllEmployees();
    this.saveScheduleToDB();
  }

  saveSchedule() {
    this.updateTotalHoursAllEmployees();
    this.saveScheduleToDB(true);
  }


  calculateShiftHours(shift: string): number {
    if (!shift) return 0;

    const [startStr, endStr] = shift.split('-').map(t => t.trim());
    if (!startStr || !endStr) return 0;

    const to24HourMinutes = (time: string): number => {
      const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (!match) return 0;

      let hour = parseInt(match[1], 10);
      const minute = match[2] ? parseInt(match[2], 10) : 0;
      const period = match[3]?.toUpperCase();

      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      if (!period) {
        if (hour < 10 || hour >= 17) hour += 12;
      }

      return hour * 60 + minute;
    };

    let start = to24HourMinutes(startStr);
    let end = to24HourMinutes(endStr);

    if (end < start) end += 24 * 60;

    return (end - start) / 60;
  }

  updateTotalHours(emp: string) {
    let total = 0;
    this.days.forEach(day => {
      const shift = this.schedule[emp][day];
      total += this.calculateShiftHours(shift as string);
    });
    this.schedule[emp].totalHours = total;
    this.updateTotalHoursAllEmployees();
  }

  updateTotalHoursAllEmployees() {
    this.TotalHours = this.employees.reduce(
      (sum, emp) => sum + (this.schedule[emp]?.totalHours || 0),
      0
    );
    this.TotalSalary = this.TotalHours * this.hourlyRate;
  }


  private async saveScheduleToDB(showAlert: boolean = false) {
    if (!this.storeId) return;
  
    const payload = {
      employees: this.employees,
      schedule: this.schedule,
      hourlyRate: this.hourlyRate,
      totalHours: this.TotalHours,
      totalSalary: this.TotalSalary,
      savedAt: new Date().toLocaleDateString('en-CA')
    };
  
    try {
      await this.scheduleService.saveWeeklySchedule(this.storeId, payload);
  
      if (showAlert) {
        alert('Schedule saved to database!');
      }
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      if (showAlert) {
        alert('Error saving schedule: ' + (err.message || err));
      }
    }
  }
  

  private async getWeeklySchedule() {
    if (!this.storeId) return;

    try {
      const savedData = await this.scheduleService.getWeeklySchedule(this.storeId);
      if (savedData) {
        this.employees = savedData['employees'] || [];
        this.schedule = savedData['schedule'] || {};
        this.hourlyRate = savedData['hourlyRate'] || 15;
      }
    } catch (err) {
      console.error('Error fetching weekly schedule:', err);
    }
  }

  private initializeScheduleDefaults() {
    this.employees.forEach(emp => {
      if (!this.schedule[emp]) this.schedule[emp] = { totalHours: 0 };
      this.days.forEach(day => {
        if (!this.schedule[emp][day]) this.schedule[emp][day] = '';
      });
      if (!this.schedule[emp].totalHours) this.schedule[emp].totalHours = 0;
    });
  }

  downloadSchedulePDF() {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4"
    });
  
    const img = new Image();
    img.src = 'assets/Logo/MaduraiPandiyas.jpeg';
  
    img.onload = () => {
  
      const tableHead = [['Employee', ...this.days, 'Total Hours']];
      const tableBody = this.employees.map(emp => {
        const row = [emp];
        this.days.forEach(day => row.push(String(this.schedule[emp][day] || '')));
        row.push(String(this.schedule[emp].totalHours.toFixed(2)));
        return row;
      });
  
      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 120,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: { top: 12, bottom: 12 },
          halign: "center",
        },
        columnStyles: { 0: { cellWidth: 110 } },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        tableWidth: "auto",
        margin: { left: 40, right: 40 },
  
        didDrawPage: (data) => {

          const pageWidth = doc.internal.pageSize.getWidth();
          const marginRight = 40; 
          const tableRight = pageWidth - marginRight;
  
          const logoWidth = 120;
          const logoHeight = 80;
  
          const logoX = tableRight - logoWidth;
          const logoY = 20; 
  
          doc.addImage(img, "JPEG", logoX, logoY, logoWidth, logoHeight);
  
          doc.setFontSize(20);
          doc.text('This Week Schedule', data.settings.margin.left, 60);
        }
      });
  
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.text("Generated by Madurai Pandiyas", 40, finalY);
  
      doc.save(`Weekly-Schedule.pdf`);
    };
  
    img.onerror = () => console.error("Logo cannot be loaded");
  }
     
}
