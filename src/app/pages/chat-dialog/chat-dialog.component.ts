import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent {

  constructor(private router: Router) { }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }
}
