import { Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';

export interface UiConfirmOptions {
  header: string;
  message: string;
  acceptLabel?: string;
  rejectLabel?: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  success(detail: string, summary = 'Sucesso'): void {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  error(detail: string, summary = 'Erro'): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  info(detail: string, summary = 'Info'): void {
    this.messageService.add({ severity: 'info', summary, detail });
  }

  warn(detail: string, summary = 'Atenção'): void {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  confirm(options: UiConfirmOptions): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.confirmationService.confirm({
        header: options.header,
        message: options.message,
        icon: options.icon,
        acceptLabel: options.acceptLabel,
        rejectLabel: options.rejectLabel,
        accept: () => {
          observer.next(true);
          observer.complete();
        },
        reject: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
