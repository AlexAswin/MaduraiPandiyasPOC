import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private firestore: Firestore) {}

  saveWeeklySchedule(storeId: string, payload: any) {
    const ref = doc(this.firestore, `stores/${storeId}/weeklySchedules/schedule`);
    return setDoc(ref, payload, { merge: true });
  }

  async getWeeklySchedule(storeId: string) {
    const ref = doc(this.firestore, `stores/${storeId}/weeklySchedules/schedule`);
    const snap = await getDoc(ref);
  
    return snap.exists() ? snap.data() : null;  }


  saveTimeSheet(storeId: string, weekId: string, employees: any[], hourlyRate: number, dateFrom: string, dateTo: string) {
    const ref = doc(this.firestore, `stores/${storeId}/timeSheets/${weekId}`);
    return setDoc(ref, { employees, hourlyRate, dateFrom, dateTo }, { merge: true });
  }

  async getTimeSheet(storeId: string, weekId: string) {
    const ref = doc(this.firestore, `stores/${storeId}/timeSheets/${weekId}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
}
