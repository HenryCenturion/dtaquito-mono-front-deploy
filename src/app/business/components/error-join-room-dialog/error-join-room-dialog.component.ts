import { Component } from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-error-join-room-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './error-join-room-dialog.component.html',
  styleUrl: './error-join-room-dialog.component.css'
})
export class ErrorJoinRoomDialogComponent {
  constructor(public dialogRef: MatDialogRef<ErrorJoinRoomDialogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
