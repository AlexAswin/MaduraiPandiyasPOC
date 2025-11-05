import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { ShipmentsComponent } from './shipments/shipments.component';
import { LogInComponent } from './log-in/log-in.component';
import { RequestComponent } from './request/request.component';
import { TotalShipmentsComponent } from './total-shipments/total-shipments.component';


export const routes: Routes = [
    { path: '', component: LogInComponent },
    { path: 'login', component: LogInComponent },
    { path: 'shipment', component: ShipmentsComponent },
    { path: 'dispatch-details', component: RequestComponent },
    { path: 'total-shipments', component: TotalShipmentsComponent }

];
