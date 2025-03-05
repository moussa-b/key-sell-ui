import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ResponseStatus } from '../../core/models/response-status.model';

@Component({
  selector: 'ks-password-reset',
  imports: [
    Button,
    FormsModule,
    InputText,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './lost-password.component.html',
})
export class LostPasswordComponent {
  email?: string;

  constructor(private authService: AuthService,
              private router: Router,
              private translateService: TranslateService) {
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.authService.forgotPassword(this.email!).subscribe((response: ResponseStatus) => {
        if (response.status) {
          this.router.navigateByUrl('/login', {info: {message: {severity: 'info', message: this.translateService.instant('auth.lost_password_confirmation_message')}}});
        }
      });
    }
  }
}
