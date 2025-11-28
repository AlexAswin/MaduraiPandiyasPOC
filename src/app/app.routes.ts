import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { ShipmentsComponent } from './shipments/shipments.component';
import { LogInComponent } from './log-in/log-in.component';
import { RequestComponent } from './request/request.component';
import { TotalShipmentsComponent } from './total-shipments/total-shipments.component';
import { authGuard } from './auth.guard';
import { EmployeeScheduleComponent } from './employee-schedule/employee-schedule.component';
import { TimeSheetComponent } from './time-sheet/time-sheet.component';


export const routes: Routes = [
    { path: '', component: LogInComponent  },
    { path: 'shipment', canActivate: [authGuard], loadComponent: () => import('./shipments/shipments.component').then(m => m.ShipmentsComponent) },
    { path: 'dispatch-details', canActivate: [authGuard], loadComponent: () => import('./request/request.component').then(m => m.RequestComponent) },
    { path: 'total-shipments', canActivate: [authGuard], loadComponent: () => import('./total-shipments/total-shipments.component').then(m => m.TotalShipmentsComponent) },
    { path: 'menu', component: MenuComponent },
    { path: 'employeeSchedule', component:  EmployeeScheduleComponent},
    { path: 'timeSheet', component: TimeSheetComponent },

];
