import { Injectable } from '@angular/core';
import { User } from 'src/app/models/signUpUserdata';
import { Firestore, collection, doc, setDoc, getDocs } from '@angular/fire/firestore';
import { ChatExistsDialogComponent } from 'src/app/chat-exists-dialog/chat-exists-dialog.component';
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
    // Retrieve existing chats from the database and populate the chats array
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

  private showChatExistsPopup() {
    const dialogRef = this.dialog.open(ChatExistsDialogComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Chat exists popup closed:', result);
    });
  }
}