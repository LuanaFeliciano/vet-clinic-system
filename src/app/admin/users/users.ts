import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../services/api/api.service';
import { UserRole } from '../../services/auth/models/auth.models';
import { UsersService } from '../../services/users/users.service';
import { PanelUser } from '../../services/users/models/users.models';
import { InputFieldComponent } from '../../components/input-field/input-field';
import { UiService } from '../../services/ui/ui.service';

interface RoleOption {
  label: string;
  value: UserRole;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    TableModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    TagModule,
    ToastModule,
    InputFieldComponent
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  readonly roleOptions: RoleOption[] = [
    { label: 'Veterinário(a)', value: 'vet' },
    { label: 'Recepcionista', value: 'recepcionista' }
  ];

  readonly userForm;

  users: PanelUser[] = [];
  search = '';

  isLoading = false;
  isSaving = false;
  deactivatingUserId: number | null = null;
  reactivatingUserId: number | null = null;
  dialogVisible = false;
  isEditing = false;
  apiErrorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    public readonly usersService: UsersService,
    private readonly uiService: UiService
  ) {
    this.userForm = this.fb.group({
      id: this.fb.control<number | null>(null),
      name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      role: this.fb.nonNullable.control<UserRole>('vet', [Validators.required]), 
      password: this.fb.nonNullable.control(''),
      password_confirmation: this.fb.nonNullable.control('')
    });

    this.userForm.setValidators(this.passwordMatchValidator.bind(this));
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): PanelUser[] {
    const term = this.search.trim().toLowerCase();

    if (!term) {
      return this.users;
    }

    return this.users.filter((user) =>
      user.name.toLowerCase().includes(term)
      || user.email.toLowerCase().includes(term)
      || this.usersService.getRoleLabel(user.role).toLowerCase().includes(term)
    );
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Editar colaborador' : 'Novo colaborador';
  }

  get submitLabel(): string {
    if (this.isSaving) {
      return this.isEditing ? 'Salvando...' : 'Criando...';
    }

    return this.isEditing ? 'Salvar alterações' : 'Criar colaborador';
  }

  openCreateDialog(): void {
    this.isEditing = false;
    this.dialogVisible = true;
    this.apiErrorMessage = null;
    this.userForm.reset({
      id: null,
      name: '',
      email: '',
      role: 'vet',
      password: '',
      password_confirmation: ''
    });
    this.configurePasswordValidators();
  }

  openEditDialog(user: PanelUser): void {
    this.isEditing = true;
    this.dialogVisible = true;
    this.apiErrorMessage = null;
    this.userForm.reset({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      password_confirmation: ''
    });
    this.configurePasswordValidators();
  }

  closeDialog(): void {
    if (this.isSaving) {
      return;
    }

    this.dialogVisible = false;
    this.apiErrorMessage = null;
    this.userForm.reset();
  }

  saveUser(): void {
    this.apiService.clearApiErrorsFromForm(this.userForm);
    this.apiErrorMessage = null;
    this.configurePasswordValidators();

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const id = this.userForm.controls.id.value;
    const payload = this.usersService.buildPayload(this.userForm.getRawValue());

    this.isSaving = true;

    const request$ = this.usersService.saveUser(id, payload);

    request$
      .pipe(finalize(() => {
        this.isSaving = false;
      }))
      .subscribe({
        next: () => {
          this.dialogVisible = false;
          this.loadUsers();
          this.uiService.success(this.isEditing ? 'Colaborador atualizado.' : 'Colaborador criado.');
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.apiErrorMessage = this.apiService.handleApiFormError(
            errorResponse,
            this.userForm,
            'Não foi possível salvar o colaborador.'
          );
        }
      });
  }

  deactivateUser(user: PanelUser): void {
    if (!user.is_active || this.deactivatingUserId) {
      return;
    }

    this.uiService.confirm({
      header: 'Inativar colaborador',
      message: `Deseja inativar ${user.name}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Inativar',
      rejectLabel: 'Cancelar'
    }).subscribe((accepted) => {
      if (!accepted) {
        return;
      }

      this.deactivatingUserId = user.id;

      this.usersService
        .deactivateUser(user.id)
        .pipe(finalize(() => {
          this.deactivatingUserId = null;
        }))
        .subscribe({
          next: (message) => {
            this.loadUsers();
            this.uiService.success(message);
          },
          error: () => {
            this.uiService.error('Não foi possível inativar o colaborador.');
          }
        });
    });
  }

  reactivateUser(user: PanelUser): void {
    if (user.is_active || this.reactivatingUserId) {
      return;
    }

    this.uiService.confirm({
      header: 'Reativar colaborador',
      message: `Deseja reativar ${user.name}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Reativar',
      rejectLabel: 'Cancelar'
    }).subscribe((accepted) => {
      if (!accepted) {
        return;
      }

      this.reactivatingUserId = user.id;

      this.usersService
        .restoreUser(user.id)
        .pipe(finalize(() => {
          this.reactivatingUserId = null;
        }))
        .subscribe({
          next: (message) => {
            this.loadUsers();
            this.uiService.success(message);
          },
          error: () => {
            this.uiService.error('Não foi possível reativar o colaborador.');
          }
        });
    });
  }

  loadUsers(): void {
    this.isLoading = true;

    this.usersService
      .listUsers()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: () => {
          this.users = [];
          this.uiService.error('Não foi possível carregar os colaboradores.');
        }
      });
  }

  hasError(controlName: 'name' | 'email' | 'role' | 'password' | 'password_confirmation'): boolean {
    const control = this.userForm.controls[controlName];
    return !!(control.invalid && (control.touched || control.dirty));
  }

  getErrorMessage(controlName: 'name' | 'email' | 'role' | 'password' | 'password_confirmation'): string {
    const control = this.userForm.controls[controlName];

    if (control.errors?.['api']) {
      return control.errors['api'] as string;
    }

    if (controlName === 'name' && control.errors?.['required']) {
      return 'Nome é obrigatório.';
    }

    if (controlName === 'name' && control.errors?.['minlength']) {
      return 'Informe ao menos 3 caracteres.';
    }

    if (controlName === 'email' && control.errors?.['required']) {
      return 'E-mail é obrigatório.';
    }

    if (controlName === 'email' && control.errors?.['email']) {
      return 'Informe um e-mail válido.';
    }

    if (controlName === 'role' && control.errors?.['required']) {
      return 'Selecione o cargo.';
    }

    if (controlName === 'password' && control.errors?.['required']) {
      return 'Senha é obrigatória para novo colaborador.';
    }

    if (controlName === 'password' && control.errors?.['minlength']) {
      return 'Senha precisa ter no mínimo 8 caracteres.';
    }

    if (controlName === 'password_confirmation' && control.errors?.['required']) {
      return 'Confirme a senha.';
    }

    return 'Campo inválido.';
  }

  private configurePasswordValidators(): void {
    const passwordControl = this.userForm.controls.password;
    const confirmationControl = this.userForm.controls.password_confirmation;

    if (this.isEditing) {
      passwordControl.setValidators([Validators.minLength(8)]);
      confirmationControl.setValidators([]);
    } else {
      passwordControl.setValidators([Validators.required, Validators.minLength(8)]);
      confirmationControl.setValidators([Validators.required]);
    }

    passwordControl.updateValueAndValidity({ emitEvent: false });
    confirmationControl.updateValueAndValidity({ emitEvent: false });
    this.userForm.updateValueAndValidity({ emitEvent: false });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as typeof this.userForm;
    const password = form.controls.password.value;
    const confirmation = form.controls.password_confirmation.value;

    if (!password && !confirmation) {
      return null;
    }

    return password === confirmation ? null : { passwordMismatch: true };
  }

}
