import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-exists-dialog',
  templateUrl: './chat-exists-dialog.component.html',
  styleUrls: ['./chat-exists-dialog.component.scss']
})
export class ChatExistsDialogComponent {

  constructor(public dialogRef: MatDialogRef<ChatExistsDialogComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }

}
