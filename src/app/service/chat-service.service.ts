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
        console.log('groupName:', chat.groupName); // Check if groupName is set correctly
        this.router.navigate(['/chat-dialog', chat.groupName]); 
      }
    }
    
  }    