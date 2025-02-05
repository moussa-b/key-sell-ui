import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService } from '../../core/services/auth.service';
import { Client } from '../entities/client.entity';
import { ClientsService } from '../clients.service';
import { ClientFormComponent } from '../client-form/client-form.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-client-list',
  imports: [
    Button,
    Card,
    IconField,
    InputIcon,
    InputText,
    PrimeTemplate,
    TableModule,
    TranslatePipe,
    ConfirmPopupModule,
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
  providers: [DialogService, ConfirmationService]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  isManagerOrAdmin = false;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private clientsService: ClientsService,
              private translateService: TranslateService,
              private authService: AuthService,
              private toasterService: ToasterService,) {
  }

  ngOnInit(): void {
    this.findAllClients();
    this.isManagerOrAdmin = this.authService.isManager || this.authService.isAdmin;
  }

  private findAllClients(): void {
    this.clientsService.findAll().subscribe((clients: Client[]) => {
      this.clients = clients || [];
    });
  }

  openNew(): void {
    this.dialogService.open(ClientFormComponent, {
      header: this.translateService.instant('clients.add_client'),
      closable: true,
      modal: true,
    }).onClose.subscribe((client: Client) => {
      if (client) {
        this.findAllClients();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  editClient(client: Client) {
    this.dialogService.open(ClientFormComponent, {
      data: {client: client},
      header: this.translateService.instant('clients.edit_client'),
      closable: true,
      modal: true,
    }).onClose.subscribe((client: Client) => {
      if (client) {
        this.findAllClients();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  deleteClient(clientId: number, event: MouseEvent) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('clients.delete_client_confirmation_message'),
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: this.translateService.instant('common.cancel'),
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: this.translateService.instant('common.delete'),
        severity: 'danger'
      },
      accept: () => {
        this.clientsService.remove(clientId).subscribe((result: boolean) => {
          if (result) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
            this.clients = this.clients.filter((u: Client) => u.id !== clientId);
          }
        });
      }
    });
  }
}
