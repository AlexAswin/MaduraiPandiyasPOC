import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ShipmentService } from '../shipment.service';
import { RequestComponent } from '../request/request.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RequestComponent,
    NavBarComponent,
    RouterModule,
  ],
  templateUrl: './shipments.component.html',
  styleUrl: './shipments.component.css',
})
export class ShipmentsComponent {
  shipmentDetails: FormGroup;
  locations = ['Madurai Pandiyas', 'Madurai Pandiyas Elite'];

  Items: string[] = [];

  units = ['Kg', 'Ltr', 'Nos'];
  ItemsInformation: { itemName: string; unitPrice: number }[] = [];

  showSnackbar = false;

  constructor(
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private router: Router
  ) {

    this.getItems();

    this.shipmentDetails = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      message: [''],
      quantity: [[''], [Validators.min(1)]],
      unit: [''],
      items: this.fb.array([], Validators.required),
    });

    this.shipmentDetails.get('from')?.valueChanges.subscribe((fromValue) => {
      const toControl = this.shipmentDetails.get('to');
      if (toControl?.value === fromValue) {
        toControl?.setValue('', { emitEvent: false });
      }
    });

    this.shipmentDetails.get('to')?.valueChanges.subscribe((toValue) => {
      const fromControl = this.shipmentDetails.get('from');
      if (fromControl?.value === toValue) {
        fromControl?.setValue('', { emitEvent: false });
      }
    });

    this.fromAndToValue();
  }

  fromAndToValue = () => {
    const user = localStorage.getItem('UserId');

    if (user === 'Madurai Pandiyas') {
      this.shipmentDetails.get('from')?.setValue('Madurai Pandiyas');
      this.shipmentDetails.get('to')?.setValue('Madurai Pandiyas Elite');
    } else {
      this.shipmentDetails.get('from')?.setValue('Madurai Pandiyas Elite');
      this.shipmentDetails.get('to')?.setValue('Madurai Pandiyas');
    }
  };

  getItems() {
    this.shipmentService.getAllItemsDetails('Items').subscribe(res => {
      this.ItemsInformation = res.map(item => ({
        itemName: item.itemName,
        unitPrice: Number(item.unitPrice) // convert from string to number
      }));
      this.Items = res.map(item => item.itemName);
    });
  }

  get items(): FormArray {
    return this.shipmentDetails.get('items') as FormArray;
  }

  addItem() {
    const item = this.shipmentDetails.get('message')?.value?.trim();
    const quantity = this.shipmentDetails.get('quantity')?.value.trim();
    const Unit = this.shipmentDetails.get('unit')?.value.trim();

    if (item && quantity && Unit) {
      this.items.push(
        this.fb.group({
          name: [item],
          quantity: [quantity],
          unit: [Unit],
        })
      );
    }
    this.shipmentDetails.get('message')?.setValue('');

    this.shipmentDetails.get('quantity')?.reset();
    this.shipmentDetails.get('unit')?.setValue('');
  }
  removeItem(index: number) {
    this.items.removeAt(index);
  }

  showMessage() {
    this.showSnackbar = true;
    setTimeout(() => (this.showSnackbar = false), 3000);
  }

  async onSubmit() {
    if (this.shipmentDetails.invalid) return;

    try {

      const DispatchedTime = new Date().toLocaleString();

      const shipmentFrom = this.shipmentDetails.get('from')?.value?.trim();
      const shipmentTo = this.shipmentDetails.get('to')?.value?.trim();

      const priceMap = new Map(this.ItemsInformation.map((p) => [p.itemName, p.unitPrice]));
      const shipmentItems = this.shipmentDetails.get('items') as FormArray;
      const shipmentItemsValue = shipmentItems.value;
      console.log(shipmentItemsValue);
  
      const shipmentItemsDetails = shipmentItemsValue.filter((item: any) =>
        priceMap.has(item.name)
      ).map((item: any) => ({
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: priceMap.get(item.name)!,
        totalPrice: item.quantity * priceMap.get(item.name)!,
      }));
      console.log(shipmentItemsDetails);
  
      const shipmentGrandTotal = shipmentItemsDetails.reduce(
        (sum: any, item: any) => sum + item.totalPrice,
        0
      );
      const shipmentDetails = { shipmentItemsDetails, DispatchedTime, shipmentGrandTotal, shipmentFrom, shipmentTo };
      console.log(shipmentDetails);

      await this.shipmentService.submitShipment(shipmentDetails, shipmentFrom);
      this.showMessage();
      this.items.clear();
    } catch (err) {
      console.error('Error submitting shipment:', err);
      alert('Error submitting shipment. Check console for details.');
    }
  }

  logOutUser = () => {
    localStorage.removeItem('UserId');
    this.router.navigate(['/']);
  }

  
}
