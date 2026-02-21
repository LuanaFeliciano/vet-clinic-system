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
  isSubmitting = false;
  apiErrorMessage: string | null = null;
  verifiedMessage: string | null = null;

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

    if (this.loginService.isLoggedIn()) {
      this.router.navigateByUrl(this.loginService.getDefaultPanelRoute());
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') {
        this.verifiedMessage = 'Email verificado com sucesso! Você já pode entrar.';
        
        this.router.navigate([], {
            queryParams: { 'verified': null },
            queryParamsHandling: 'merge'
        });
      }
    });
  }

  getControl(name: string): FormControl {
    return this.loginForm.get(name) as FormControl;
  }

  getFieldErrorMessage(field: string, defaultMessage: string): string {
    const control = this.loginForm.get(field);
    const apiMessage = control?.errors?.['api'];
    return apiMessage ?? defaultMessage;
  }

  submitForm() {
    this.apiService.clearApiErrorsFromForm(this.loginForm);
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
}
