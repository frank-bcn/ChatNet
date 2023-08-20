import { Injectable } from '@angular/core';
import { User } from 'src/app/models/signUpUserdata';
import { Firestore, collection, doc, setDoc, getDocs } from '@angular/fire/firestore';
import { ChatExistsDialogComponent } from 'src/app/chat-exists-dialog/chat-exists-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  contactList: User[] = [];
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

  async addUserToContactList(loggedInUserId: string, userToAdd: User) {
    // Check if a chat already exists between the logged in user and the user to add
    const existingChat = this.chats.find(chat =>
      (chat.loggedInUid === loggedInUserId && chat.addedUid === userToAdd.uid) ||
      (chat.loggedInUid === userToAdd.uid && chat.addedUid === loggedInUserId)
    );

    if (!existingChat) {
      this.contactList.push(userToAdd);
      console.log('Benutzer zur Kontaktliste hinzugefügt:', userToAdd);

      const chatData = {
        loggedInUid: loggedInUserId,
        addedUid: userToAdd.uid,
      };

      this.chats.push(chatData);
      await this.saveChatToDatabase(chatData);
    } else {
      this.showChatExistsPopup();
    }
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

  async checkIfChatExists(loggedInUserId: string, otherUserId: string): Promise<boolean> {
    // Überprüfen Sie, ob ein Chat bereits zwischen den beiden Benutzern besteht
    const chatExists = this.chats.some(chat => 
      (chat.loggedInUid === loggedInUserId && chat.addedUid === otherUserId) ||
      (chat.loggedInUid === otherUserId && chat.addedUid === loggedInUserId)
    );
  
    return chatExists;
  }
  
  async checkIfChatWithBothExists(uid1: string, uid2: string): Promise<boolean> {
    // Überprüfen Sie, ob ein Chat bereits mit beiden Benutzern existiert
    const chatExists = this.chats.some(chat => 
      (chat.loggedInUid === uid1 && chat.addedUid === uid2) ||
      (chat.loggedInUid === uid2 && chat.addedUid === uid1)
    );
  
    return chatExists;
  }
}