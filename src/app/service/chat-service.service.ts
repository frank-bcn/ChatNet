import { Injectable } from '@angular/core';
import { User } from 'src/app/models/signUpUserdata';
import { Firestore, collection, doc, setDoc, getDocs, getDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  loggedInUserId: string = '';
  selectedUser: User | null = null;
  chats: any[] = [];
  
  constructor(private firestore: Firestore, private dialog: MatDialog) { }

  async initializeChats() {
    const chatsCollectionRef = collection(this.firestore, 'chats');
    const chatsSnapshot = await getDocs(chatsCollectionRef);

    chatsSnapshot.forEach(doc => {
      this.chats.push(doc.data());
    });
  }

  async saveChatToDatabase(chatData: any) {
    try {
      const chatsCollectionRef = collection(this.firestore, 'chats');
      await setDoc(doc(chatsCollectionRef), chatData);

    } catch (error) {
      console.error('Fehler beim Speichern des Chats in der Datenbank:', error);
    }
  }
  
  async addOrGetChat(user1Id: string, user2Id: string) {
    const sortedUserIds = [user1Id, user2Id].sort();
    const chatId = sortedUserIds.join('_'); 
  
    const chatCollectionRef = collection(this.firestore, 'chats');
    const chatDocRef = doc(chatCollectionRef, chatId);
  
    const chatDocSnapshot = await getDoc(chatDocRef);
    if (chatDocSnapshot.exists()) {
      return chatDocSnapshot.data(); 
    }
  
    const chatData = { users: sortedUserIds };
    await setDoc(chatDocRef, chatData);
  
    return chatData;
  }
  
}