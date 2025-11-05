import { Component, OnInit } from '@angular/core';
import { ShipmentService } from '../shipment.service';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DownloadPDFComponent } from '../download-pdf/download-pdf.component';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-total-shipments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DownloadPDFComponent ],
  templateUrl: './total-shipments.component.html',
  styleUrl: './total-shipments.component.css',
})
export class TotalShipmentsComponent implements OnInit {
  dispatchedFromMaduraiPandiyas: any[] | null = [];
  dispatchedFromMaduraiPandiyasElite: any[] | null = [];

  totalDispatchedItems?: any[] | null = [];
  filteredShipments?: any[] = [];

  MaduraiPandiyas: boolean = false;
  MaduraiPandiyasElite: boolean = false;

  locations = ['Total Shipments', 'Madurai Pandiyas', 'Madurai Pandiyas Elite'];
  fromStoreControl = new FormControl('Total Shipments');
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');
  updateUnitPrice = new FormControl('');

  

  addItemsForm!: FormGroup;
  allItems: {
    itemName: any; unitPrice: number;
  }[] | undefined;


  constructor(private shipmentService: ShipmentService, private fb: FormBuilder,) {

    this.addItemsForm = this.fb.group({
      itemName: [''],
      unitPrice: [''],
      updateItem: [''],
      UpdatedUnitPrice: [''],
      deleteItem: ['']
      // items: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.getAllShipments();
    this.getAllItems();
  }

  getAllShipments = () => {
    const maduraiPandiyas = 'Madurai Pandiyas';
    const maduraiPandiyasElite = 'Madurai Pandiyas Elite';

    combineLatest([
      this.shipmentService.getAllShipmentDetails(maduraiPandiyas),
      this.shipmentService.getAllShipmentDetails(maduraiPandiyasElite),
    ]).subscribe(
      ([resMadurai, resElite]) => {
        this.dispatchedFromMaduraiPandiyas = Array.isArray(resMadurai)
          ? resMadurai
          : Object.values(resMadurai ?? []);
        this.dispatchedFromMaduraiPandiyasElite = Array.isArray(resElite)
          ? resElite
          : Object.values(resElite ?? []);

        this.totalDispatchedItems = [
          ...(this.dispatchedFromMaduraiPandiyas ?? []),
          ...(this.dispatchedFromMaduraiPandiyasElite ?? []),
        ];

        console.log('Total dispatched items:', this.totalDispatchedItems);
      },
      (error) => {
        console.error('Error fetching shipments:', error);
      }
    );

    console.log(this.totalDispatchedItems);
    
  };

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

    const storeName = event.target as HTMLSelectElement;

    if (storeName.value === 'Madurai Pandiyas') {
      this.MaduraiPandiyas = true;
      this.totalDispatchedItems = this.dispatchedFromMaduraiPandiyas;
    } else if (storeName.value === 'Madurai Pandiyas Elite') {
      this.MaduraiPandiyasElite = true;
      this.totalDispatchedItems = this.dispatchedFromMaduraiPandiyasElite;
    } else {
      this.getTotalDispatchedItems();
    }
  }

  getTotalDispatchedItems = () => {
    this.totalDispatchedItems = [
      ...(this.dispatchedFromMaduraiPandiyas ?? []),
      ...(this.dispatchedFromMaduraiPandiyasElite ?? []),
    ];
  }

  applyFilters = () => {
    this.getTotalDispatchedItems();

    const startDateEle = document.getElementById('startDate') as HTMLInputElement | null;
    const endDateEle = document.getElementById('endDate') as HTMLInputElement | null;
  
    if (!startDateEle?.value && !endDateEle?.value) {
      this.filteredShipments = [];
      return;
    }
  
    const startDate = startDateEle?.value
      ? new Date(startDateEle.value + 'T00:00:00')
      : null;
    const endDate = endDateEle?.value
      ? new Date(endDateEle.value + 'T23:59:59')
      : null;
  
    console.log('Filter range:', startDate, endDate);
  
    this.filteredShipments = (this.totalDispatchedItems ?? [])
      .filter((item: any) => {
        const dispatchedDate = new Date(item.DispatchedTime);
  
        const matchStart = !startDate || dispatchedDate >= startDate;
        const matchEnd = !endDate || dispatchedDate <= endDate;
  
        return matchStart && matchEnd;
      })
      .sort(
        (a, b) =>
          new Date(b.DispatchedTime).getTime() -
          new Date(a.DispatchedTime).getTime()
      );
  
    console.log('Filtered Shipments:', this.filteredShipments);

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

updatePrice = () => {
  const updateItem = this.addItemsForm.get('updateItem')?.value?.trim();
  const updatedUnitPrice = this.addItemsForm.get('UpdatedUnitPrice')?.value?.trim();

  this.shipmentService.updateItemPrice(updateItem, updatedUnitPrice);

  this.addItemsForm.get('updateItem')?.setValue('');
  this.addItemsForm.get('UpdatedUnitPrice')?.setValue('');
}

deleteItem = () => {
  const deleteItem = this.addItemsForm.get('deleteItem')?.value?.trim();
  this.shipmentService.deleteItem(deleteItem);
  this.addItemsForm.get('deleteItem')?.setValue('');
}

// downloadPDF() {
//   const doc = new jsPDF();
//   let currentY = 15;

//   const img = new Image();
//   img.src = `${window.location.origin}/assets/Logo/MaduraiPandiyas.jpeg`;

//   img.onload = () => {
//     doc.addImage(img, 'JPEG', 155, 10, 40, 30);

//     doc.setFontSize(16);
//     doc.text('Dispatched Shipments Report', 14, currentY);
//     currentY += 15;

//     if (!this.totalDispatchedItems || this.totalDispatchedItems.length === 0) {
//       doc.text('No dispatched items available.', 14, currentY);
//       doc.save('Dispatched_Shipments_Report.pdf');
//       return;
//     }

//     const firstShipment = this.totalDispatchedItems[0];
//     doc.setFontSize(12);
//     doc.text(`From: ${firstShipment.shipmentFrom}`, 14, currentY);
//     currentY += 6;
//     doc.text(`To: ${firstShipment.shipmentTo}`, 14, currentY);
//     currentY += 10;

//     const groupedByDate: { [key: string]: any[] } = {};

//     this.totalDispatchedItems.forEach((shipment: any) => {
//       const date = new Date(shipment.DispatchedTime).toLocaleDateString('en-CA');
//       shipment.shipmentItemsDetails?.forEach((item: any) => {
//         if (!groupedByDate[date]) groupedByDate[date] = [];
//         groupedByDate[date].push({
//           itemName: item.itemName,
//           quantity: `${item.quantity}${item.unit || ''}`,
//           unitPrice: item.unitPrice,
//           totalPrice: item.totalPrice,
//         });
//       });
//     });

//     Object.keys(groupedByDate)
//       .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
//       .forEach(date => {
//         doc.setFontSize(12);
//         doc.text(`${date}`, 14, currentY);
//         currentY += 6;

//         autoTable(doc, {
//           head: [['Item', 'Quantity', 'Unit Price', 'Total Price']],
//           body: groupedByDate[date].map(item => [
//             item.itemName,
//             item.quantity,
//             `CAD${item.unitPrice}`,
//             `CAD${item.totalPrice}`,
//           ]),
//           startY: currentY,
//           margin: { left: 14, right: 14 },
//           theme: 'grid',
//           styles: { fontSize: 10, halign: 'center' },
//           headStyles: { fillColor: [22, 160, 133] },
//         });

//         if ((doc as any).lastAutoTable) {
//           currentY = (doc as any).lastAutoTable.finalY + 10;
//         }
//       });

//     const grandTotal = Object.values(groupedByDate)
//       .flat()
//       .reduce((sum, item: any) => sum + Number(item.totalPrice), 0);

//     doc.setFontSize(12);
//     doc.text(`Grand Total: CAD${grandTotal.toFixed(2)}`, 14, currentY);

//     doc.setFontSize(10);
//     doc.text('Generated by Madurai Pandiyas', 14, 290);

//     doc.save('Dispatched_Shipments_Report.pdf');
//   };
// }

downloadPDF() {
  const doc = new jsPDF();
  let currentY = 15;

  // Use relative path to ensure it works on GitHub Pages too
  const img = new Image();
  img.src = 'assets/Logo/MaduraiPandiyas.jpeg';

  img.onload = () => {
    // Draw logo top-right
    doc.addImage(img, 'JPEG', 155, 10, 40, 30);

    // Title
    doc.setFontSize(16);
    doc.text('Dispatched Shipments Report', 14, currentY);
    currentY += 15;

    if (!this.totalDispatchedItems || this.totalDispatchedItems.length === 0) {
      doc.setFontSize(12);
      doc.text('No dispatched items available.', 14, currentY);
      doc.save('Dispatched_Shipments_Report.pdf');
      return;
    }

    // From / To (take first shipment as reference)
    const firstShipment = this.totalDispatchedItems[0];
    doc.setFontSize(12);
    doc.text(`From: ${firstShipment.shipmentFrom}`, 14, currentY);
    currentY += 6;
    doc.text(`To: ${firstShipment.shipmentTo}`, 14, currentY);
    currentY += 10;

    // Group items by date
    const groupedByDate: { [key: string]: any[] } = {};
    this.totalDispatchedItems.forEach((shipment: any) => {
      const date = new Date(shipment.DispatchedTime).toLocaleDateString('en-CA');
      shipment.shipmentItemsDetails?.forEach((item: any) => {
        if (!groupedByDate[date]) groupedByDate[date] = [];
        groupedByDate[date].push({
          itemName: item.itemName,
          quantity: `${item.quantity}${item.unit || ''}`,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
      });
    });

    // Sort dates descending
    Object.keys(groupedByDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(date => {
        doc.setFontSize(12);
        doc.text(`${date}`, 14, currentY);
        currentY += 6;

        // Table for items
        autoTable(doc, {
          head: [['Item', 'Quantity', 'Unit Price', 'Total Price']],
          body: groupedByDate[date].map(item => [
            item.itemName,
            item.quantity,
            `CAD${item.unitPrice}`,
            `CAD${item.totalPrice}`,
          ]),
          startY: currentY,
          margin: { left: 14, right: 14 },
          theme: 'grid',
          styles: { fontSize: 10, halign: 'center' },
          headStyles: { fillColor: [22, 160, 133] },
        });

        // Update currentY for next date
        if ((doc as any).lastAutoTable) {
          currentY = (doc as any).lastAutoTable.finalY + 10;
        }
      });

    // Grand Total
    const grandTotal = Object.values(groupedByDate)
      .flat()
      .reduce((sum, item: any) => sum + Number(item.totalPrice), 0);

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

}


