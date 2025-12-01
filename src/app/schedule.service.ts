import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private firestore: Firestore) {}

  saveWeeklySchedule(storeId: string, weekId: string, payload: any) {
    const ref = doc(this.firestore, `stores/${storeId}/weeklySchedules/${weekId}`);
    return setDoc(ref, payload, { merge: true });
  }

  async getWeeklySchedule(storeId: string, weekId: string) {
    const ref = doc(this.firestore, `stores/${storeId}/weeklySchedules/${weekId}`);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data();
    } else {
      return null;
    }
  }
}
