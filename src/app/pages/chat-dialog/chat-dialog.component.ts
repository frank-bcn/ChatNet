import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChatService } from 'src/app/service/chat-service.service';
import { ChatDataService } from 'src/app/service/chat-data.service';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit {
  chat: any = {};

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public chatService: ChatService,
    public chatDataService: ChatDataService
  ) { }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        const selectedChat = this.chatDataService.currentChatDetails;
        this.chat = selectedChat ? { ...selectedChat } : {};
        if (this.chat.selectedContacts) {
          for (const contactUid of this.chat.selectedContacts) {
            const username = await this.chatDataService.loadUsernameViaUID(contactUid);
            this.chatDataService.chatUsernames[contactUid] = username;
          }
        }
      }
    });
  }

  // naviegiert zur mainpage
  goToMainPage() {
    this.router.navigate(['/chats']);
  }

  sendMessage() {

  }
}