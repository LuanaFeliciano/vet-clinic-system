import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm!: FormGroup;
  showPassword = false;

  currentStep = 1;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      // --- PASSO 1: USUÁRIO ---
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],

      // --- PASSO 2: CLÍNICA ---
      clinicName: ['', Validators.required],
      phone: ['', Validators.required],
      clinicType: ['pequenos', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  hasError(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  nextStep() {
    const step1Fields = ['name', 'email', 'password', 'confirmPassword', 'terms'];
    const isStep1Valid = step1Fields.every(field => this.registerForm.get(field)?.valid);

    if (isStep1Valid && !this.registerForm.errors?.['mismatch']) {
      this.currentStep = 2;
    } else {
      step1Fields.forEach(field => this.registerForm.get(field)?.markAsTouched());
    }
  }
  prevStep() {
    this.currentStep = 1;
  }

  submitForm() {
    if (this.registerForm.valid) {
      console.log('Enviando dados...', this.registerForm.value);

      //colocar aqui depois api, se der certo step 3
      setTimeout(() => {
        this.currentStep = 3;
      }, 1000);
    }
  }
}
