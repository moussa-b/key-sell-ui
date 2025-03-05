import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ResponseStatus } from '../../core/models/response-status.model';

@Component({
  selector: 'ks-activate',
  imports: [
    Button,
    FormsModule,
    InputText,
    Password,
    TranslatePipe
  ],
  templateUrl: './activate.component.html'
})
export class ActivateComponent implements OnInit {
  activationToken?: string;
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
    this.activationToken = params.get('token') != null ? params.get('token')! : undefined;
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.authService.activate(this.username!, this.password!, this.activationToken!).subscribe((response: ResponseStatus) => {
        if (response.status) {
          this.router.navigateByUrl('/login', {info: {message: {severity: 'info', message: this.translateService.instant('auth.activation_confirmation_message')}}});
        }
      });
    }
  }
}
