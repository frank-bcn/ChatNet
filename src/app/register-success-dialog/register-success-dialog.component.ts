import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-register-success-dialog',
  templateUrl: './register-success-dialog.component.html',
})
export class RegisterSuccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RegisterSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
