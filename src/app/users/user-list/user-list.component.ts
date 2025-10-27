import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { User } from '../entities/user.entity';
import { ConfirmationService, MenuItem, MenuItemCommandEvent, PrimeIcons } from 'primeng/api';
import { UsersService } from '../users.service';
import { DialogService } from 'primeng/dynamicdialog';
import { UserFormComponent } from '../user-form/user-form.component';
import { Card } from 'primeng/card';
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { ToasterService } from '../../core/services/toaster.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserAccess } from '../../core/models/user-access.model';
import { Menu } from 'primeng/menu';
import { UpperCasePipe } from '@angular/common';
import { SendEmailComponent } from '../../core/components/send-email/send-email.component';
import { SendEmailModel } from '../../core/models/send-email.model';
import { ResponseStatus } from '../../core/models/response-status.model';
import { Subscription } from 'rxjs';
import { UserAccessFormComponent } from '../user-access-form/user-access-form.component';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'ks-user-list',
  imports: [
    TableModule,
    ConfirmPopupModule,
    Button,
    IconField,
    InputIcon,
    Tag,
    Card,
    TranslatePipe,
    InputText,
    Menu,
    UpperCasePipe
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  providers: [ConfirmationService, UsersService, DialogService],
  encapsulation: ViewEncapsulation.None
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  userAccess!: UserAccess;
  items!: MenuItem[];
  _selectedUser?: User;
  set selectedUser(user: User | undefined) {
    if (user) {
      let userAccessItem = this.items.find((item: MenuItem) => item.id === 'user-access');
      if (userAccessItem) {
        userAccessItem.visible = user.isActive;
      }
    }
    this._selectedUser = user;
  }
  get selectedUser(): User | undefined {
    return this._selectedUser;
  }
  private langChangeSubscription!: Subscription;
  currentUserId!: number;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private usersService: UsersService,
              private translateService: TranslateService,
              private elementRef: ElementRef,
              private permissionService: PermissionService,
              private toasterService: ToasterService,
              private clipboard: Clipboard) {
  }

  ngOnInit(): void {
    this.userAccess = this.permissionService.getUserAccess();
    this.currentUserId = this.permissionService.userId;
    this.initializeMenu();
    this.findAllUsers();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initializeMenu();
    });
  }

  private initializeMenu() {
    this.items = [
      {
        label: this.translateService.instant('common.edit'),
        icon: PrimeIcons.USER_EDIT,
        command: () => this.editUser(),
        visible: this.userAccess.canEditUsers
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => this.deleteUser(menuEvent.originalEvent!),
        visible: this.userAccess.canEditUsers
      },
      {
        label: this.translateService.instant('common.send_email'),
        icon: PrimeIcons.ENVELOPE,
        command: () => this.sendEmailToUser(),
        visible: this.userAccess.canSendEmail
      },
      {
        label: this.translateService.instant('users.access_rights_management'),
        icon: PrimeIcons.LOCK,
        command: () => this.editUserAccess(),
        visible: this.userAccess.canEditUsersAccess,
        id: 'user-access'
      }
    ].filter((m: MenuItem) => m.visible !== false);
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private findAllUsers(): void {
    this.usersService.findAll().subscribe((users: User[]) => {
      this.users = users || [];
    });
  }

  openNew(): void {
    this.dialogService.open(UserFormComponent, {
      header: this.translateService.instant('users.add_user'),
      closeOnEscape: false,
      closable: true,
      modal: true,
    })?.onClose.subscribe((user: User) => {
      if (user) {
        this.findAllUsers();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  editUser() {
    this.dialogService.open(UserFormComponent, {
      data: {user: this.selectedUser},
      header: this.translateService.instant('users.edit_user'),
      closeOnEscape: false,
      closable: true,
      modal: true,
    })?.onClose.subscribe((user: User) => {
      this.selectedUser = undefined;
      if (user) {
        this.findAllUsers();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  editUserAccess() {
    this.dialogService.open(UserAccessFormComponent, {
      data: {userId: this.selectedUser!.id},
      header: this.translateService.instant('users.access_rights_management'),
      closeOnEscape: false,
      closable: true,
      modal: true,
    })?.onClose.subscribe((updated?: boolean) => {
      this.selectedUser = undefined;
      if (updated) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  deleteUser(event: Event) {
    const userId = this.selectedUser!.id!;
    this.selectedUser = undefined;
    const button = this.elementRef.nativeElement.querySelector(`tr[data-user-id='${userId}'] button`);
    this.confirmationService.confirm({
      target: button || event?.target as EventTarget,
      message: this.translateService.instant('users.delete_user_confirmation_message'),
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
        this.usersService.remove(userId).subscribe((result: boolean) => {
          if (result) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
            this.users = this.users.filter((u: User) => u.id !== userId);
          }
        });
      }
    });
  }

  sendEmailToUser() {
    this.dialogService.open(SendEmailComponent, {
      header: this.translateService.instant('common.send_email_to', { recipient: `${this.selectedUser!.lastName.toUpperCase()} ${this.selectedUser!.firstName}` }),
      closable: true,
      closeOnEscape: false,
      modal: true,
    })?.onClose.subscribe((sendEmailModel: SendEmailModel) => {
      if (sendEmailModel) {
        this.usersService.sendEmail(this.selectedUser!.id!, sendEmailModel).subscribe((res: ResponseStatus) => {
          if (res.status) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
          }
        });
      }
      this.selectedUser = undefined;
    });
  }

  copyToClipboard(text: string): void {
    this.clipboard.copy(text);
    this.toasterService.emitValue({
      severity: 'info',
      summary: this.translateService.instant('common.information'),
      detail: this.translateService.instant('common.success_copy')
    });
  }
}
