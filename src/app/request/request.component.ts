import { Component, OnInit } from '@angular/core';
import { ShipmentService } from '../shipment.service';
import { CommonModule, NgFor } from '@angular/common';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, NgFor, NavBarComponent, RouterModule],
  templateUrl: './request.component.html',
  styleUrl: './request.component.css'
})
export class RequestComponent implements OnInit {

  DispatchedItemsList: any[] = [];

  constructor ( private shipmentService: ShipmentService ) {

  }

  ngOnInit(): void {
    this.ShipmentsSent();
  }

  ShipmentsSent = () => {
    const User = localStorage.getItem('UserId');
  
    this.shipmentService.getAllShipmentDetails(User!).subscribe((res: any[]) => {
      this.DispatchedItemsList = res
        .filter(item => item.DispatchedDate)
        .sort((a, b) => b.DispatchedDate.localeCompare(a.DispatchedDate));
  
      console.log(this.DispatchedItemsList);
    });
  };
  
  

}
