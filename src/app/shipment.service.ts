import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, getDocs, query, where, updateDoc, arrayRemove, setDoc, arrayUnion } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  private shipments$ = new BehaviorSubject<any[]>([]);
  shipmentsObservable = this.shipments$.asObservable();

  constructor(private firestore: Firestore) { }

  async submitShipment(dispatchedItemDetails: any, shipmentFrom: string) {
    try {
      const orderCollection = collection(this.firestore, shipmentFrom);
  
      // Extract only the date part from DispatchedTime (YYYY-MM-DD)
      const dispatchedDate = new Date(dispatchedItemDetails.DispatchedTime)
                                .toDateString();
  
      // Step 1: Query for documents with the SAME date
      const q = query(
        orderCollection,
        where("DispatchedDate", "==", dispatchedDate)
      );
  
      const result = await getDocs(q);
  
      // Step 2: If a document with same date exists → update it
      if (!result.empty) {
        const existingDoc = result.docs[0];
  
        const existingData: any = existingDoc.data();
  
        const mergedItems = [
          ...existingData.shipmentItemsDetails,
          ...dispatchedItemDetails.shipmentItemsDetails
        ];
  
        await updateDoc(existingDoc.ref, {
          shipmentItemsDetails: mergedItems,
          shipmentGrandTotal:
            existingData.shipmentGrandTotal +
            dispatchedItemDetails.shipmentGrandTotal
        });
  
        return existingDoc.id; // return updated document ID
      }
  
      // Step 3: If no document exists → create a new one
      const newDocRef = await addDoc(orderCollection, {
        ...dispatchedItemDetails,
        DispatchedDate: dispatchedDate
      });
  
      return newDocRef.id;
  
    } catch (error) {
      console.error("Error adding shipment:", error);
      throw error;
    }
  }

  getAllShipmentDetails(User: string): Observable<any[]> {
    const user = User === 'Madurai Pandiyas' ? 'Madurai Pandiyas' : 'Madurai Pandiyas Elite';
    const colRef = collection(this.firestore, user); 
    return collectionData(colRef, { idField: 'id' }); 
  }


setShipments(data: any[]) {
  this.shipments$.next([...data]);
}

getShipments() {
  return [...this.shipments$.value];
}

  getAllItemsDetails(Items: string): Observable<any[]> {
    
    const colRef = collection(this.firestore, Items); 
    return collectionData(colRef, { idField: 'id' }); 
  }

  deleteShipmentById(deleteFrom: string, id: string) {
    const docRef = doc(this.firestore, deleteFrom, id);
    return deleteDoc(docRef);
  }

  updateItemPrice(itemName: string, newPrice: number) {
    const itemRef = collection(this.firestore, 'Items');
    const q = query(itemRef, where('itemName', '==', itemName));
  
    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(async (document) => {
          const docRef = doc(this.firestore, 'Items', document.id);
          await updateDoc(docRef, { unitPrice: newPrice });
        });
      }
    }).catch(error => {
      console.error('Error updating item price:', error);
    });
  }

  async deleteItem(itemName: string) {
    try {
      const itemsRef = collection(this.firestore, 'Items');
      const q = query(itemsRef, where('itemName', '==', itemName));
  
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        snapshot.forEach(async (document) => {
          const docRef = doc(this.firestore, 'Items', document.id);
          await deleteDoc(docRef);
          console.log(`Deleted item: ${itemName}`);
        });
      } else {
        console.log('No item found with that name.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  submitItemRequest(data: any, docName: string) {
    const docRef = doc(this.firestore, 'Purchase List', docName);
  
    return setDoc(docRef, {
        items: arrayUnion(...data.items),
        RequestedOn: data.RequestedOn
    }, { merge: true });
  } 

  getPurchaseItems(purchaseItems: string): Observable<any[]> {
    const itemCollection = collection(this.firestore, purchaseItems);
    return collectionData(itemCollection, { idField: 'id' });
  }

  deletePurchasedItems(docId: string, purchasedItems: any[]) {
    const docRef = doc(this.firestore, "Purchase List", docId);
    return updateDoc(docRef, {
      items: arrayRemove(...purchasedItems)
    });
  }
  

}
