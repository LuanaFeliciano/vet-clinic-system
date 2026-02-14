import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Importante para o routerLink funcionar
import { InputFieldComponent } from '../../components/input-field/input-field';
import { trigger, style, animate, transition } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterService } from '../../services/auth/register.service';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    RouterModule, 
    InputFieldComponent
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class Register {
  registerForm!: FormGroup;
  showPassword = false;
  currentStep = 1;
  isSubmitting = false;
  apiErrorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly registerService: RegisterService,
    private readonly apiService: ApiService
  ) { }

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

  getControl(name: string): FormControl {
    return this.registerForm.get(name) as FormControl;
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

  getFieldErrorMessage(field: string, defaultMessage: string): string {
    const control = this.registerForm.get(field);
    const apiMessage = control?.errors?.['api'];
    return apiMessage ?? defaultMessage;
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
    this.apiService.clearApiErrorsFromForm(this.registerForm);
    this.apiErrorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      name: this.getControl('name').value,
      email: this.getControl('email').value,
      password: this.getControl('password').value,
      password_confirmation: this.getControl('confirmPassword').value,
      clinicName: this.getControl('clinicName').value,
      phone: this.getControl('phone').value,
      clinicType: this.getControl('clinicType').value
    };

    this.registerService.register(payload).subscribe({
      next: () => {
        this.currentStep = 3;
        this.isSubmitting = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.apiErrorMessage = this.apiService.handleApiFormError(
          errorResponse,
          this.registerForm,
          'Não foi possível concluir o cadastro. Tente novamente.',
          { fieldMapper: { password_confirmation: 'confirmPassword' } }
        );
        this.isSubmitting = false;
      }
    });
  }
}
