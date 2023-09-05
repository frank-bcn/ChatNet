import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatDataService } from 'src/app/service/chat-data.service';

@Injectable({
  providedIn: 'root',
})

export class ChatService {


  constructor(
    private router: Router,
    public chatDataService: ChatDataService

    ) {}

    openChatDialog(chat: any) {
      if (chat) {
        this.chatDataService.currentChatDetails = {};
        this.chatDataService.currentChatDetails = { ...chat };
        console.log('selectedContacts vor der Navigation:', this.chatDataService.chatUsernames);
        
        this.router.navigate(['/chat-dialog', chat.groupName], { state: { selectedContacts: this.chatDataService.selectedContacts } });
      }
    }
  }    