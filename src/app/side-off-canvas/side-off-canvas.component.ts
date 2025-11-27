import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ShipmentService } from '../shipment.service';

@Component({
  selector: 'app-side-off-canvas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-off-canvas.component.html',
  styleUrl: './side-off-canvas.component.css'
})
export class SideOffCanvasComponent {

  itemsRequest = new FormControl('');
  reqItems: string[] = [];

  @Output() messageEvent = new EventEmitter<string>();

  constructor (private router: Router, private fb: FormBuilder, private shipmentService: ShipmentService,) {

  }

  addReqItem = () => {
    const reqItem = this.itemsRequest.value?.trim();
    this.reqItems.push(reqItem as string);

    this.itemsRequest.reset();
  }

  removeReqItem(index: number) {
    this.reqItems.splice(index, 1);
    localStorage.setItem("Saved Items", JSON.stringify(this.reqItems));
  }

  submitRequest = async () => {

    this.SaveReqItems();
    const RequiredItems = localStorage.getItem("Saved Items");
    const RequiredItemsParsed = RequiredItems ? JSON.parse(RequiredItems) : [];
    const RequestedOn = new Date().toLocaleString();
    const RequestedBy = localStorage.getItem('UserId');

    const requestData = {RequestedOn: RequestedOn , items: RequiredItemsParsed};
    try {
      await this.shipmentService.submitItemRequest(requestData, `${RequestedBy} ItemsReq` );
      this.reqItems = []
      localStorage.removeItem('Saved Items');
      this.messageEvent.emit('Request submitted successfully!');
      
    } catch (err) {
      this.messageEvent.emit('Failed to submit request.');
    }
  }

  SaveReqItems = async () => {

    const itemsToSave = this.reqItems;
    localStorage.setItem('Saved Items', JSON.stringify(itemsToSave) );
    this.messageEvent.emit('Items Saved successfully!');
  }

  logOutUser = () => {
    localStorage.removeItem('UserId');
    this.router.navigate(['/']);
  }

}
