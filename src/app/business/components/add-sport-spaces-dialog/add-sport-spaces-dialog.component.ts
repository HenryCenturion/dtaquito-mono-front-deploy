import {Component, Inject} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-add-sport-spaces-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDialogActions,
    MatButton,
    MatDialogContent,
    MatLabel,
    MatSelect,
    MatOption,
    NgForOf,
    NgIf,
    MatError
  ],
  templateUrl: './add-sport-spaces-dialog.component.html',
  styleUrl: './add-sport-spaces-dialog.component.css'
})
export class AddSportSpacesDialogComponent {
  sportSpaceForm: FormGroup;
  sports = [
    { id: 1, name: 'FUTBOL' },
    { id: 2, name: 'BILLAR' }
  ];
  districts = [
    'Cercado de Lima', 'San Isidro', 'Miraflores', 'San Borja', 'Surco',
    'La Molina', 'San Miguel', 'Magdalena', 'Pueblo Libre', 'Lince',
    'Jesus Maria', 'Barranco', 'Chorrillos', 'San Juan de Lurigancho',
    'San Juan de Miraflores', 'Villa El Salvador', 'Villa Maria del Triunfo'
  ];
  imageUrl: string | null = null;
  gamemodes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddSportSpacesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.sportSpaceForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      sportId: [data?.sportId || null, Validators.required],
      userId: this.getUserIdFromLocalStorage(),
      imageUrl: [data?.imageUrl || '', Validators.required],
      price: [data?.price || 0, Validators.required],
      district: [data?.district || '', Validators.required],
      description: [data?.description || '', Validators.required],
      startTime: [data?.startTime || '', Validators.required],
      endTime: [data?.endTime || '', Validators.required],
      rating: [data?.rating || 0],
      gamemode: [data?.gamemode || '', Validators.required],
      amount: [data?.amount || 0, Validators.required]
    }, { validators: amountValidator() });

    if (data?.id) {
      this.sportSpaceForm.addControl('id', this.fb.control(data.id));
    }

    this.updateImagePreview();
    this.onSportChange();
  }

  updateImagePreview(): void {
    this.imageUrl = this.sportSpaceForm.get('imageUrl')?.value;
  }

  onGamemodeChange(): void {
    this.updateAmount();
  }

  onSportChange(): void {
    const sportId = this.sportSpaceForm.get('sportId')?.value;
    if (sportId === 1) {
      this.gamemodes = ['FUTBOL_11', 'FUTBOL_8', 'FUTBOL_7', 'FUTBOL_5'];
    } else if (sportId === 2) {
      this.gamemodes = ['BILLAR_3'];
    }
    this.sportSpaceForm.get('gamemode')?.reset();
    this.updateAmount();
  }

  onSubmit(): void {
    if (this.sportSpaceForm.valid) {
      this.dialogRef.close(this.sportSpaceForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private getUserIdFromLocalStorage(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId');
    }
    return null;
  }


  updateAmount(): void {
    const price = this.sportSpaceForm.get('price')?.value;
    const gamemode = this.sportSpaceForm.get('gamemode')?.value;
    const maxPlayers = getMaxPlayers(gamemode);
    const calculatedAmount = Math.floor((price / 2) / maxPlayers);
    this.sportSpaceForm.get('amount')?.setValue(calculatedAmount);
  }
}

export function amountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const price = control.get('price')?.value;
    const gamemode = control.get('gamemode')?.value;
    const amount = control.get('amount')?.value;

    const maxPlayers = getMaxPlayers(gamemode);
    const calculatedAmount = Math.floor((price / 2) / maxPlayers);

    return amount > calculatedAmount ? { invalidAmount: true } : null;
  };
}

function getMaxPlayers(gamemode: string): number {
  switch (gamemode) {
    case 'FUTBOL_11':
      return 22;
    case 'FUTBOL_8':
      return 16;
    case 'FUTBOL_7':
      return 14;
    case 'FUTBOL_5':
      return 10;
    case 'BILLAR_3':
      return 3;
    default:
      return 1;
  }
}
