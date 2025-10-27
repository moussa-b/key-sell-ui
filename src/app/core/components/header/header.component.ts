import { Component, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MyAccountComponent } from '../../../users/my-account/my-account.component';
import { PermissionService } from '../../services/permission.service';
import { UserAccess } from '../../models/user-access.model';
import { Ripple } from 'primeng/ripple';
import { UserRole } from '../../../users/entities/user.entity';
import { environment } from '../../../../environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToasterService } from '../../services/toaster.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'ks-header',
  imports: [
    TranslatePipe,
    RouterLink,
    Avatar,
    Menu,
    RouterLinkActive,
    Ripple
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [DialogService]
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  menuItems: MenuItem[] = [];
  userAccess: UserAccess;
  userIdentity?: string;
  userRole: UserRole | undefined;
  private serverVersion?: string;

  constructor(private authService: AuthService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private router: Router,
              private permissionService: PermissionService,
              private toasterService: ToasterService,
              private clipboard: Clipboard,
              private commonService: CommonService) {
    this.userAccess = this.permissionService.getUserAccess();
    this.userIdentity = this.permissionService.userIdentity;
    this.userRole = this.permissionService.userRole;
  }

  ngOnInit() {
    this.buildMenuItems();
    this.commonService.getVersion().subscribe((res: {version: string}) => {
      if (res.version) {
        this.serverVersion = res.version;
        for (const m of this.menuItems) {
          if (m.id === 'version') {
            for (const item of m.items!) {
              if (item.id === 'server-version') {
                item.label = `${res.version} (${this.translateService.instant('common.server')})`;
                item.visible = true;
                break;
              }
            }
            break;
          }
        }
      }
    });
  }

  private buildMenuItems() {
    this.menuItems = [
      {
        label: this.translateService.instant('header.change_language'),
        items: [
          {
            label: this.translateService.instant('common.french'),
            flag: '/flags/fr.svg',
            command: () => this.changeLanguage('fr')
          },
          {
            label: this.translateService.instant('common.english'),
            flag: '/flags/sh.svg',
            command: () => this.changeLanguage('en')
          }
        ]
      },
      {
        label: this.translateService.instant('header.profile'),
        items: [
          {
            label: this.translateService.instant('header.my_account'),
            icon: 'pi pi-user',
            command: () => this.editProfile()
          },
          {label: this.translateService.instant('header.logout'), icon: 'pi pi-sign-out', command: () => this.logout()}
        ]
      },
      {
        label: this.translateService.instant('common.version'),
        id: 'version',
        items: [
          {
            label: environment.version,
            icon: 'pi pi-copy',
            command: () => {
              this.clipboard.copy(environment.version);
              this.toasterService.emitValue({
                severity: 'info',
                summary: this.translateService.instant('common.information'),
                detail: this.translateService.instant('common.success_copy')
              });
            }
          },
          ...(UserRole.ADMIN === this.userRole ? [
            {
              label: '',
              icon: 'pi pi-copy',
              id: 'server-version',
              visible: false,
              command: () => {
                this.clipboard.copy(this.serverVersion!);
                this.toasterService.emitValue({
                  severity: 'info',
                  summary: this.translateService.instant('common.information'),
                  detail: this.translateService.instant('common.success_copy')
                });
              }
            }
          ] : [])
        ]
      }
    ];
  }

  private changeLanguage(language: string) {
    this.translateService.use(language).subscribe(() => {
      this.buildMenuItems();
    });
  }

  private editProfile() {
    this.dialogService.open(MyAccountComponent, {
      header: this.translateService.instant('auth.edit_my_account'),
      closable: true,
      closeOnEscape: false,
      modal: true,
    });
  }

  private logout() {
    this.authService.logout();
    this.router.navigate(['/login'], {state: {message: {severity: 'info', message: this.translateService.instant('auth.logout_confirmation_message')}}});
  }
}
