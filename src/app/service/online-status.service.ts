import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';

@Injectable({
  providedIn: 'root'
})

export class OnlineStatusService {

  isOnline: boolean = false;
  

  constructor(private firestore: Firestore) {}

  //aktualisiert den Online-Status eines Users 
  async updateUserOnlineStatus(userId: string, online: boolean) {
    const userDocRef = doc(this.firestore, 'users', userId);
    await updateDoc(userDocRef, {
      online
    });
  }

  // ruft den Online-Status eines Users aus der Firestore-Datenbank ab und gibt diesen Status zurück
  async checkUserOnlineStatus(userId: string): Promise<boolean> {
    const userDocRef = doc(this.firestore, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data() as User;

    return userData ? userData.online : false;
  }
}