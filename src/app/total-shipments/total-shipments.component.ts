import { Component, OnInit } from '@angular/core';
import { ShipmentService } from '../shipment.service';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DownloadPDFComponent } from '../download-pdf/download-pdf.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-total-shipments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule ],
  templateUrl: './total-shipments.component.html',
  styleUrl: './total-shipments.component.css',
})
export class TotalShipmentsComponent implements OnInit {
  dispatchedFromMaduraiPandiyas: any[] | null = [];
  dispatchedFromMaduraiPandiyasElite: any[] | null = [];

  totalDispatchedItems?: any[] | null = [];
  originalDispatchedItems?: any[] | null = [];
  filteredShipments?: any[] = [];

  MaduraiPandiyas: boolean = false;
  MaduraiPandiyasElite: boolean = false;
  confirmDeleteItem: boolean = false;

  shipmentFrom: string = 'Madurai Pandiyas';
  shipmentTo: string = 'Madurai Pandiyas Elite'

  AddProductDetails: boolean = false;
  updatePriceEle: boolean = false;
  deleteProductEle: boolean = false;
  storeChange: boolean = false;
  activeStore: string = 'Madurai Pandiyas'

  locations = ['Madurai Pandiyas', 'Madurai Pandiyas Elite'];
  fromStoreControl = new FormControl('Madurai Pandiyas');
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');
  updateUnitPrice = new FormControl('');

  

  addItemsForm!: FormGroup;
  allItems: { itemName: any; unitPrice: number; }[] | undefined;

  currentDocId: string = '';
  purchaseDocs: { id: string, items: any[] }[] = [];
  ItemsToPurchase: any[] = [];
  // purchaseItems!: any[];


  constructor(private shipmentService: ShipmentService, private fb: FormBuilder, private router: Router) {

    this.addItemsForm = this.fb.group({
      itemName: [''],
      unitPrice: [''],
      updateItem: [''],
      UpdatedUnitPrice: [''],
      deleteItem: [''],
      confirmDeleteItem: ['']
      // items: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.getShipmentDetails('Madurai Pandiyas');
    this.getAllItems();
    this.getPurchaseList();
  }

  getShipmentDetails = (shipmentFrom: string) => {
    const { monday, sunday } = this.getCurrentWeekRange();
  
    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];
  
    this.shipmentService.getAllShipmentDetails(shipmentFrom).subscribe(
      (resMadurai) => {
        this.dispatchedFromMaduraiPandiyas = Array.isArray(resMadurai)
          ? resMadurai
          : Object.values(resMadurai ?? []);
  
        const thisWeekItems = this.dispatchedFromMaduraiPandiyas.filter((item: any) => {
          if (!item.DispatchedDate) return false;
          return item.DispatchedDate >= mondayStr && item.DispatchedDate <= sundayStr;
        });
  
        this.shipmentService.setShipments(this.dispatchedFromMaduraiPandiyas);
  
        this.totalDispatchedItems = [...thisWeekItems].sort((a: any, b: any) => {
          return b.DispatchedDate.localeCompare(a.DispatchedDate);
        });
  
        console.log('Sorted dispatched items (Madurai Pandiyas):', this.totalDispatchedItems);
      },
      (error) => {
        console.error('Error fetching shipments:', error);
      }
    );
  }
  

  getCurrentWeekRange() {
    const today = new Date();
    const day = today.getDay();
  
  
    const diffToMonday = (day === 0 ? 6 : day - 1);
  
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
  
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
  
    return { monday, sunday };
  }
  
  getAllItems = () => {
      this.shipmentService.getAllItemsDetails('Items').subscribe(res => {
        this.allItems = res.map(item => ({
          itemName: item.itemName,
          unitPrice: Number(item.unitPrice) 
        }));
        this.allItems = res.map(item => item.itemName);
      });

  }

  onStoreChange = (event: Event) => {
    this.storeChange = true;
    const storeName = event.target as HTMLSelectElement;

    if (storeName.value === 'Madurai Pandiyas') {
      this.shipmentFrom = 'Madurai Pandiyas'
      this.shipmentTo = 'Madurai Pandiyas Elite'
      this.getShipmentDetails('Madurai Pandiyas');
    } else if (storeName.value === 'Madurai Pandiyas Elite') {
      this.shipmentFrom = 'Madurai Pandiyas Elite'
      this.shipmentTo = 'Madurai Pandiyas'
      this.getShipmentDetails('Madurai Pandiyas Elite');
    }
  }

  getTotalDispatchedItems = () => {
    this.totalDispatchedItems = [
      ...(this.dispatchedFromMaduraiPandiyas ?? []),
      ...(this.dispatchedFromMaduraiPandiyasElite ?? []),
    ];
  }

  applyFilters = () => {

    const filterItems = this.shipmentService.getShipments();
  
    const startDateEle = document.getElementById('startDate') as HTMLInputElement | null;
    const endDateEle = document.getElementById('endDate') as HTMLInputElement | null;
  
    if (!startDateEle?.value && !endDateEle?.value) {
      this.filteredShipments = [];
      this.totalDispatchedItems = [];
      return;
    }
  
    const startDateStr = startDateEle?.value || null;
    const endDateStr = endDateEle?.value || null;
  
    this.filteredShipments = filterItems
      .filter((item: any) => {
        if (!item.DispatchedDate) return false;
  
        const matchStart = !startDateStr || item.DispatchedDate >= startDateStr;
        const matchEnd = !endDateStr || item.DispatchedDate <= endDateStr;
  
        return matchStart && matchEnd;
      })
      .sort((a, b) => b.DispatchedDate.localeCompare(a.DispatchedDate));
  
    this.totalDispatchedItems = this.filteredShipments;
  };
  
  
deleteShipment = (dispatchedItems: any) => {
  console.log(dispatchedItems)
  const confirmDelete = window.confirm('Are you sure you want to delete this shipment?');

  if (confirmDelete) {
    this.shipmentService.deleteShipmentById(dispatchedItems.shipmentFrom, dispatchedItems.id)
      .then(() => {
        this.totalDispatchedItems = this.totalDispatchedItems?.filter(
          (item: any) => item.id !== dispatchedItems.id
        );
        console.log('Shipment deleted successfully.');
      })
      .catch((error) => {
        console.error('Error deleting shipment:', error);
      });
  }
  console.log(this.totalDispatchedItems);
}

showAddProductDetails() {
  this.updatePriceEle = false;
  this.deleteProductEle = false
  this.AddProductDetails = !this.AddProductDetails;
  
}

addProduct = () => {
  if (this.addItemsForm.invalid) return;

  const itemDate = {
     itemName : this.addItemsForm.get('itemName')?.value?.trim(),
     unitPrice : this.addItemsForm.get('unitPrice')?.value?.trim()
  }

  this.shipmentService.submitShipment(itemDate, 'Items');

  this.addItemsForm.get('itemName')?.setValue('');
  this.addItemsForm.get('unitPrice')?.setValue('');

}

showUpdatePriceEle() {
  this.AddProductDetails = false;
  this.deleteProductEle = false
  this.updatePriceEle = !this.updatePriceEle;
}

updatePrice = () => {
  const updateItem = this.addItemsForm.get('updateItem')?.value?.trim();
  const updatedUnitPrice = this.addItemsForm.get('UpdatedUnitPrice')?.value?.trim();

  this.shipmentService.updateItemPrice(updateItem, updatedUnitPrice);

  this.addItemsForm.get('updateItem')?.setValue('');
  this.addItemsForm.get('UpdatedUnitPrice')?.setValue('');
}

showDeleteProductElm() {
  this.AddProductDetails = false;
  this.updatePriceEle = false
  this.deleteProductEle = !this.deleteProductEle;
}

deleteItem = () => {
  const deleteItem = this.addItemsForm.get('deleteItem')?.value?.trim();
  const confirmDeleteItem = this.addItemsForm.get('confirmDeleteItem')?.value?.trim();

  if(deleteItem === confirmDeleteItem) {
    this.confirmDeleteItem = true;
    this.shipmentService.deleteItem(deleteItem);
    this.addItemsForm.get('deleteItem')?.setValue('');
    this.addItemsForm.get('confirmDeleteItem')?.setValue('');
  }

}

logout = () => {
  localStorage.removeItem('UserId');
  this.router.navigate(['/']);
}

closeForm = () => {
  this.addItemsForm.reset();
}

downloadPDF() {
  const doc = new jsPDF();
  let currentY = 15;

  const img = new Image();
  img.src = 'assets/Logo/MaduraiPandiyas.jpeg';

  img.onload = () => {
    doc.addImage(img, 'JPEG', 155, 10, 40, 30);

    doc.setFontSize(16);
    doc.text('Dispatched Shipments Report', 14, currentY);
    currentY += 15;

    if (!this.totalDispatchedItems || this.totalDispatchedItems.length === 0) {
      doc.setFontSize(12);
      doc.text('No dispatched items available.', 14, currentY);
      doc.save('Dispatched_Shipments_Report.pdf');
      return;
    }

    const firstShipment = this.totalDispatchedItems[0];
    doc.setFontSize(12);
    doc.text(`From: ${firstShipment.shipmentFrom}`, 14, currentY);
    currentY += 6;
    doc.text(`To: ${firstShipment.shipmentTo}`, 14, currentY);
    currentY += 10;

    const groupedByDate: { [key: string]: { items: any[]; total: number } } = {};

    this.totalDispatchedItems.forEach((shipment: any) => {
      const date = shipment.DispatchedDate;

      if (!groupedByDate[date]) {
        groupedByDate[date] = { items: [], total: 0 };
      }

      shipment.shipmentItemsDetails?.forEach((item: any) => {
        groupedByDate[date].items.push({
          itemName: item.itemName,
          quantity: `${item.quantity}${item.unit || ''}`,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
        groupedByDate[date].total += item.totalPrice;
      });
    });

    Object.keys(groupedByDate)
      .sort((a, b) => b.localeCompare(a)) 
      .forEach(date => {
        doc.setFontSize(12);
        doc.text(`${date}`, 14, currentY);
        currentY += 6;

        autoTable(doc, {
          head: [['Item', 'Quantity', 'Unit Price', 'Total Price']],
          body: groupedByDate[date].items.map(item => [
            item.itemName,
            item.quantity,
            `CAD${item.unitPrice}`,
            `CAD${item.totalPrice}`,
          ]),
          foot: [['', '', 'Total', `CAD${groupedByDate[date].total.toFixed(2)}`]],
          footStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' },
          startY: currentY,
          margin: { left: 14, right: 14 },
          theme: 'grid',
          styles: { fontSize: 10, halign: 'center' },
          headStyles: { fillColor: [22, 160, 133] },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      });

    const grandTotal = Object.values(groupedByDate).reduce(
      (sum, group) => sum + group.total,
      0
    );

    doc.setFontSize(12);
    doc.text(`Grand Total: CAD${grandTotal.toFixed(2)}`, 14, currentY);

    // Footer
    doc.setFontSize(10);
    doc.text('Generated by Madurai Pandiyas', 14, 290);

    doc.save('Dispatched_Shipments_Report.pdf');
  };

  img.onerror = () => {
    console.error('Logo not found! Make sure the path is correct.');
  };
}


PurchasedItems: { name: string, docId: string }[] = [];

drop(event: CdkDragDrop<{ name: string, docId: string }[]>) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}


getPurchaseList = () => {
  this.shipmentService.getPurchaseItems('Purchase List').subscribe(data => {
    this.ItemsToPurchase = data.flatMap(doc => 
      (doc.items ?? []).map((item: any)=> ({
        name: item,
        docId: doc.id 
      }))
    );

    this.purchaseDocs = data.map(doc => ({
      id: doc.id,
      items: doc.items
    }));

    console.log('Items with document IDs:', this.ItemsToPurchase);
  });
}


confirmPurchase() {
  if (this.PurchasedItems.length === 0) return;

  const deletePromises = this.purchaseDocs.map(doc => {

    const itemsToDelete = doc.items.filter(itemName => 
      this.PurchasedItems.some(p => p.name === itemName && p.docId === doc.id)
    );

    if (itemsToDelete.length > 0) {
      return this.shipmentService.deletePurchasedItems(doc.id, itemsToDelete);
    }

    return Promise.resolve(); 
  });

  Promise.all(deletePromises)
    .then(() => {
      console.log("Deleted purchased items from Firebase ✅");

    
      this.ItemsToPurchase = this.ItemsToPurchase.filter(
        item => !this.PurchasedItems.some(p => p.name === item.name && p.docId === item.docId)
      );

      this.PurchasedItems = [];
    })
    .catch(err => console.error("Delete error:", err));
}


  
}


