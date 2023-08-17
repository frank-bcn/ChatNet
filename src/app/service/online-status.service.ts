import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'src/app/models/signUpUserdata';

@Injectable({
  providedIn: 'root'
})
export class OnlineStatusService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore
  ) {}

  async setOnlineStatus(userId: string, online: boolean) {
    console.log('Setting online status for user:', userId, 'to', online);
    const userDocRef = doc(this.firestore, 'users', userId);
    await updateDoc(userDocRef, {
      online
    });
  }

  async getOnlineStatus(userId: string): Promise<boolean> {
    const userDocRef = doc(this.firestore, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data() as User;

    return userData ? userData.online : false;
  }
}