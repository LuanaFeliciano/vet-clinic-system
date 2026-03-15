import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputFieldComponent } from '../../components/input-field/input-field';
import { LoginService } from '../../services/auth/login.service';
import { ApiService } from '../../services/api/api.service';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputFieldComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class Login {
  loginForm!: FormGroup;
  forgotForm!: FormGroup;
  resetForm!: FormGroup;
  isSubmitting = false;
  isSubmittingForgot = false;
  isSubmittingReset = false;
  currentView: 'login' | 'forgot' | 'reset' = 'login';
  loginSuccessMessage: string | null = null;
  apiErrorMessage: string | null = null;
  forgotErrorMessage: string | null = null;
  forgotSuccessMessage: string | null = null;
  resetErrorMessage: string | null = null;
  verifiedMessage: string | null = null;
  showResetTokenField = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly loginService: LoginService,
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group(
      {
        token: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );

    if (this.loginService.isLoggedIn()) {
      this.router.navigateByUrl(this.loginService.getDefaultPanelRoute());
      return;
    }

    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];

      if (token || email) {
        this.currentView = 'reset';
        this.showResetTokenField = !token;
        this.resetForm.patchValue({
          token: token ?? '',
          email: email ?? ''
        });
      }

      if (params['verified'] === 'true') {
        this.verifiedMessage = 'Email verificado com sucesso! Você já pode entrar.';
        
        this.router.navigate([], {
            queryParams: { 'verified': null },
            queryParamsHandling: 'merge'
        });
      }
    });
  }

  getLoginControl(name: string): FormControl {
    return this.loginForm.get(name) as FormControl;
  }

  getForgotControl(name: string): FormControl {
    return this.forgotForm.get(name) as FormControl;
  }

  getResetControl(name: string): FormControl {
    return this.resetForm.get(name) as FormControl;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmControl = form.get('confirmPassword');
    const confirmPassword = confirmControl?.value;
    const mismatch = password && confirmPassword && password !== confirmPassword;

    if (confirmControl) {
      if (mismatch) {
        confirmControl.setErrors({ ...(confirmControl.errors ?? {}), mismatch: true });
      } else if (confirmControl.errors?.['mismatch']) {
        const { mismatch: _, ...remainingErrors } = confirmControl.errors;
        confirmControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
      }
    }

    return mismatch ? { mismatch: true } : null;
  }

  getFieldErrorMessage(form: FormGroup, field: string, defaultMessage: string): string {
    const control = form.get(field);
    const apiMessage = control?.errors?.['api'];
    if (control?.errors?.['mismatch']) {
      return 'As senhas não conferem.';
    }
    return apiMessage ?? defaultMessage;
  }

  get title(): string {
    if (this.currentView === 'forgot') {
      return 'Recuperar senha';
    }

    if (this.currentView === 'reset') {
      return 'Redefinir senha';
    }

    return 'Acesse sua conta';
  }

  get subtitle(): string {
    if (this.currentView === 'forgot') {
      return 'Informe seu e-mail para receber o link de redefinição.';
    }

    if (this.currentView === 'reset') {
      return 'Crie uma nova senha para continuar no sistema.';
    }

    return 'Entre para continuar no sistema da clínica.';
  }

  switchView(view: 'login' | 'forgot' | 'reset') {
    this.currentView = view;
    this.clearMessages();
  }

  clearMessages() {
    this.loginSuccessMessage = null;
    this.apiErrorMessage = null;
    this.forgotErrorMessage = null;
    this.forgotSuccessMessage = null;
    this.resetErrorMessage = null;
    this.verifiedMessage = null;
  }

  submitForm() {
    this.apiService.clearApiErrorsFromForm(this.loginForm);
    this.loginSuccessMessage = null;
    this.apiErrorMessage = null;
    this.verifiedMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.loginService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl(this.loginService.getDefaultPanelRoute());
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.apiErrorMessage = this.apiService.handleApiFormError(
          errorResponse,
          this.loginForm,
          'Não foi possível fazer login. Tente novamente.'
        );
        this.isSubmitting = false;
      }
    });
  }

  submitForgotForm() {
    this.apiService.clearApiErrorsFromForm(this.forgotForm);
    this.forgotErrorMessage = null;
    this.forgotSuccessMessage = null;

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmittingForgot = true;

    this.loginService.forgotPassword(this.forgotForm.value).subscribe({
      next: (message) => {
        this.forgotSuccessMessage = message;
        this.isSubmittingForgot = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.forgotErrorMessage = this.apiService.handleApiFormError(
          errorResponse,
          this.forgotForm,
          'Não foi possível enviar o link. Tente novamente.'
        );
        this.isSubmittingForgot = false;
      }
    });
  }

  submitResetForm() {
    this.apiService.clearApiErrorsFromForm(this.resetForm);
    this.resetErrorMessage = null;

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmittingReset = true;

    const payload = {
      token: this.getResetControl('token').value,
      email: this.getResetControl('email').value,
      password: this.getResetControl('password').value,
      password_confirmation: this.getResetControl('confirmPassword').value
    };

    this.loginService.resetPassword(payload).subscribe({
      next: (message) => {
        this.isSubmittingReset = false;
        this.switchView('login');
        this.loginSuccessMessage = message;
        this.router.navigate([], {
          queryParams: { token: null, email: null },
          queryParamsHandling: 'merge'
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.resetErrorMessage = this.apiService.handleApiFormError(
          errorResponse,
          this.resetForm,
          'Não foi possível redefinir a senha. Tente novamente.',
          { fieldMapper: { password_confirmation: 'confirmPassword' } }
        );
        this.isSubmittingReset = false;
      }
    });
  }
}
