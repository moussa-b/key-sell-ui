import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Password } from 'primeng/password';
import { InputText } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Message } from 'primeng/message';
import { HttpErrorResponse } from '@angular/common/http';
import { AccessToken } from '../../core/models/access-token.model';
import { environment } from '../../../environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'ks-login',
  imports: [
    FormsModule,
    TranslatePipe,
    Password,
    InputText,
    Checkbox,
    Button,
    RouterLink,
    Message
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  rememberMe = false;
  password?: string;
  username?: string;
  message?: {
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | null | undefined;
    message: string
  };
  version = environment.version;

  constructor(private authService: AuthService, private router: Router,
              public translateService: TranslateService,
              private clipboard: Clipboard,
              private toasterService: ToasterService,) {
  }

  ngOnInit() {
    const state = history.state;
    if (state?.['message']) {
      this.message = state['message'];
      history.replaceState({}, '');
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.authService.login(this.username!.trim(), this.password!, this.rememberMe).subscribe({
        next: (response: AccessToken) => {
          if (response?.accessToken && response.accessToken?.length > 0) {
            this.router.navigateByUrl('/real-estates');
          }
        },
        error: (error: HttpErrorResponse) => {
          this.message = {severity: 'error', message: this.translateService.instant('auth.login_invalid_error_message')}
        }
      });
    }
  }

  onCloseMessage() {
    this.message = undefined;
  }

  changeLanguage(language: string) {
    if (this.translateService.currentLang !== language) {
      this.translateService.use(language);
    }
  }

  copyVersion() {
    this.clipboard.copy(this.version);
    this.toasterService.emitValue({
      severity: 'info',
      summary: this.translateService.instant('common.information'),
      detail: this.translateService.instant('common.success_copy')
    });
  }
}
