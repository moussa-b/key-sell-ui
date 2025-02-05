import { Component, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MyAccountComponent } from '../../../users/my-account/my-account.component';

@Component({
  selector: 'app-header',
  imports: [
    TranslatePipe,
    RouterLink,
    Avatar,
    Menu
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [DialogService]
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private router: Router,) {
  }

  ngOnInit() {
    this.buildMenuItems();
  }

  private buildMenuItems() {
    this.menuItems = [
      {
        label: this.translateService.instant('header.change_language'),
        items: [
          {
            label: this.translateService.instant('common.french'),
            icon: 'pi pi-flag',
            command: () => this.changeLanguage('fr')
          },
          {
            label: this.translateService.instant('common.english'),
            icon: 'pi pi-flag',
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
      modal: true,
    });
  }

  private logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', {info: {message: {severity: 'info', message: this.translateService.instant('auth.logout_confirmation_message')}}});
  }
}
