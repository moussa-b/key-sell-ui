import { Component } from '@angular/core';
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

@Component({
  selector: 'app-login',
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
export class LoginComponent {
  rememberMe = false;
  password?: string;
  username?: string;
  message?: {severity: string; message: string};

  constructor(private authService: AuthService, private router: Router, private translateService: TranslateService,) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.info) {
      this.message = (navigation.extras.info as any)['message'];
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.authService.login(this.username!, this.password!, this.rememberMe).subscribe({
        next: (response: AccessToken) => {
          if (response?.accessToken && response.accessToken?.length > 0) {
            this.router.navigateByUrl('/buyers');
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
}
