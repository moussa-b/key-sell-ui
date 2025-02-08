import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { ToasterService } from '../../core/services/toaster.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserAccess } from '../../core/models/user-access.model';
import { Menu } from 'primeng/menu';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-user-list',
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
export class UserListComponent implements OnInit {
  users: User[] = [];
  isAdmin = false;
  userAccess!: UserAccess;
  items!: MenuItem[];
  selectUser?: User;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private usersService: UsersService,
              private translateService: TranslateService,
              private elementRef: ElementRef,
              private permissionService: PermissionService,
              private toasterService: ToasterService,) {
  }

  ngOnInit(): void {
    this.userAccess = this.permissionService.getUserAccess();
    this.items = [
      {
        label: this.translateService.instant('common.edit'),
        icon: PrimeIcons.USER_EDIT,
        command: () => {
          this.editUser();
        }
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => {
          this.deleteUser(menuEvent.originalEvent!)
        }
      }
    ];
    this.findAllUsers();
    this.isAdmin = this.permissionService.isAdmin
  }

  private findAllUsers(): void {
    this.usersService.findAll().subscribe((users: User[]) => {
      this.users = users || [];
    });
  }

  openNew(): void {
    this.dialogService.open(UserFormComponent, {
      header: this.translateService.instant('users.add_user'),
      closable: true,
      modal: true,
    }).onClose.subscribe((user: User) => {
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
      data: {user: this.selectUser},
      header: this.translateService.instant('users.edit_user'),
      closable: true,
      modal: true,
    }).onClose.subscribe((user: User) => {
      this.selectUser = undefined;
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

  deleteUser(event: Event) {
    const userId = this.selectUser!.id!;
    this.selectUser = undefined;
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
}
