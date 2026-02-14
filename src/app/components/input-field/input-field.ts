import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss'
})
export class InputFieldComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
  @Input() errorMessage: string = '';
  @Input() forceError: boolean = false;

  showPassword = false;

  get isPassword(): boolean {
    return this.type === 'password';
  }

  get inputType(): string {
    if (this.isPassword) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  hasError(): boolean {
    if (this.forceError) return true;
    return !!(this.control?.invalid && (this.control?.dirty || this.control?.touched));
  }
}