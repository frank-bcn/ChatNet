import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent {
  @Input() selectedUser: User | null = null;

  messages: Message[] = [];
  messageInput: string = '';

  constructor(private router: Router) { }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  sendMessage() {
    if (this.messageInput.trim() === '') {
      return;
    }

    const newMessage: Message = {
      text: this.messageInput,
      time: this.getCurrentTime(),
      sentByUser: true
    };
    this.messages.push(newMessage);

    // You can now send the message to the server or take other actions as needed

    this.messageInput = ''; // Clear the message input after sending
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
}