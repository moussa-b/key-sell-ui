import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { NgClass } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { User } from '../entities/user.entity';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { AuthService } from '../../core/services/auth.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Password } from 'primeng/password';
import { Router } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Sex } from '../../core/models/sex.enum';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-my-account',
  imports: [
    FormsModule,
    ConfirmPopupModule,
    InputText,
    Button,
    ReactiveFormsModule,
    SelectButton,
    TranslatePipe,
    TabsModule,
    ProgressSpinner,
    NgClass,
    Password
  ],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
  providers: [ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class MyAccountComponent implements OnInit {
  userForm!: FormGroup;
  securityForm!: FormGroup;
  sexOptions!: SelectItem<Sex>[];
  isLoading = true;

  constructor(private fb: FormBuilder,
              private confirmationService: ConfirmationService,
              private authService: AuthService,
              private toasterService: ToasterService,
              private router: Router,
              private dialogRef: DynamicDialogRef,
              private translateService: TranslateService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe((user: User) => {
      this.userForm = this.fb.group({
        lastName: [user?.lastName, Validators.required],
        firstName: [user?.firstName, Validators.required],
        sex: [user?.sex],
        email: [user?.email, [Validators.required, Validators.email]],
      });
      this.securityForm = this.fb.group({
        username: [user.username, [Validators.required, Validators.minLength(3)]],
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.minLength(6)]],
        confirmPassword: [''],
      }, {validators: this.passwordsMatchValidator});
      this.isLoading = false;
    });
    this.sexOptions= [
      { label: this.translateService.instant('common.man'), value: Sex.MALE },
      { label: this.translateService.instant('common.woman'), value: Sex.FEMALE },
    ];
  }

  passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSavePersonalInfo() {
    if (this.userForm.valid) {
      let userFormValue = this.userForm.getRawValue();
      this.authService.updateProfile(userFormValue).subscribe((user: User) => {
        if (user && user.id! > 0) {
          this.toasterService.emitValue({
            severity: 'success',
            summary: this.translateService.instant('common.success'),
            detail: this.translateService.instant('common.success_message')
          });
        }
      });
    }
  }

  onSaveSecurityInfo(button: Button) {
    if (this.securityForm.valid) {
      this.confirmationService.confirm({
        target: button.el.nativeElement,
        message: this.translateService.instant('auth.reconnection_confirmation_message'),
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: this.translateService.instant('common.cancel'),
          severity: 'secondary',
          outlined: true
        },
        acceptButtonProps: {
          label: this.translateService.instant('common.validate'),
          severity: 'danger',
        },
        accept: () => {
          let securityFormValue = this.securityForm.getRawValue();
          this.authService.updateProfileSecurity(securityFormValue).subscribe((response: {status: boolean}) => {
            if (response.status) {
              this.dialogRef.close();
              this.authService.logout();
              this.router.navigateByUrl('/login', {info: {message: {severity: 'info', message: this.translateService.instant('security.account_updated_confirmation_message')}}});
            }
          });
        }
      });
    }
  }
}
