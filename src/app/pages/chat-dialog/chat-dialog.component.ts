import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/signUpUserdata';
import { ChatService } from 'src/app/service/chat-service.service';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent {
  loggedInUser: User = new User(); 
  message: string = '';
  chatHistory: { sender: User, receiver: User, message: string }[] = [];

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  sendMessage() {
   
  }
}  
























/* @Input() selectedUser: User | null = null;
 @Injectable({providedIn: 'root'})

 messages: Message[] = [];
 messageInput: string = '';
 loggedInUserId: string = '';
 receiverId: string ='';





 ngOnInit() {
   this.afAuth.authState.subscribe((user) => {
     if (user) {
       this.loggedInUserId = user.uid;
       /*this.messages = this.getStoredMessages() || [];
       this.selectedUser = history.state.selectedUser; 
     }
   });
 }
 
 

 /*sendMessage() {
   if (this.messageInput.trim() === '') {
     return;
   }
 
   if (!this.selectedUser) {
     console.error('No selected user to send message to.');
     return;
   }
 
   const newMessage: Message = {
     text: this.messageInput,
     time: this.getCurrentTime(),
     sentByUser: true,
   };
 
   // Save the message in the sender's conversation
   this.saveMessage(this.loggedInUserId, this.selectedUser.uid, newMessage)
     .then(() => {
       console.log('Message sent and saved successfully!');
     })
     .catch((error) => {
       console.error('Error sending and saving message:', error);
     });
 
   // Save the message in the receiver's conversation
   this.saveMessage(this.selectedUser.uid, this.loggedInUserId, {
     ...newMessage,
     sentByUser: false, // Mark the message as sent by the other user
   })
     .then(() => {
       console.log('Message sent and saved for the receiver successfully!');
     })
     .catch((error) => {
       console.error('Error sending and saving message for the receiver:', error);
     });
 
   this.messages.push(newMessage);
   this.messageInput = ''; // Clear the message input after sending
 }

 

 saveMessageService() {
   this.chatService.isReceiverAuthorized(this.loggedInUserId, this.selectedUser)
     .then((isAuthorized) => {
       if (isAuthorized) {
         this.chatService.addMessageToUser(this.loggedInUserId, {
           message: this.messageInput, 
           receiverId: this.receiverId
         });
         this.messageInput = '';
       } else {
         console.log('Der Empfänger ist nicht berechtigt, die Nachrichten zu sehen.');
         
       }
     });
 }
/*diese funktioniert*/
/*saveMessageService() {
  this.chatService.addMessageToUser(this.loggedInUserId,{message:'', receiverId:this.receiverId});
  
}*/


/*saveMessage(userUid: string, otherUserUid: string, message: Message): Promise<void> {
  const conversationId = this.getConversationId(userUid, otherUserUid);
  const conversationRef = doc(this.firestore, 'conversations', conversationId);
  const messagesRef = collection(conversationRef, 'messages');
 
  // Save the message with Firestore's automatic document ID generation
  return addDoc(messagesRef, message).then(() => {});
}
 
getConversationId(userUid: string, otherUserUid: string): string {
  const sortedIds = [userUid, otherUserUid].sort();
  return sortedIds.join('_');
}
 
storeMessages(messages: Message[]) {
  const messagesString = JSON.stringify(messages);
  localStorage.setItem('chatMessages', messagesString);
}

getStoredMessages(): Message[] | null {
  const messagesString = localStorage.getItem('chatMessages');
  return messagesString ? JSON.parse(messagesString) : null;
}

getCurrentTime(): string {
  const now = new Date();
  return now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
}
}

interface Message {
text: string;
time: string;
sentByUser: boolean;
}*/
