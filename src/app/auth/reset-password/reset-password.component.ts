import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-activate',
  imports: [
    FormsModule,
    Password,
    TranslatePipe,
    Button,
    InputText
  ],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordToken?: string;
  password?: string;
  username?: string;

  constructor(private authService: AuthService,
              private router: Router,
              private translateService: TranslateService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.username = params.get('username') != null ? params.get('username')! : undefined;
    this.resetPasswordToken = params.get('token') != null ? params.get('token')! : undefined;
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.authService.resetPassword(this.username!, this.password!, this.resetPasswordToken!).subscribe((response: {status: boolean}) => {
        if (response.status) {
          this.router.navigateByUrl('/login', {info: {message: {severity: 'info', message: this.translateService.instant('auth.reset_password_confirmation_message')}}});
        }
      });
    }
  }
}
