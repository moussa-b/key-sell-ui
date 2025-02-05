import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { User, UserRole } from '../entities/user.entity';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { Button } from 'primeng/button';
import { UsersService } from '../users.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Sex } from '../../core/models/sex.enum';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    FormsModule,
    InputText,
    TranslatePipe,
    ReactiveFormsModule,
    DropdownModule,
    Button,
    Select,
    SelectButton
  ],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  roleOptions!: SelectItem<UserRole>[];
  sexOptions!: SelectItem<Sex>[];
  preferredLanguageOptions!: SelectItem<string>[];

  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private usersService: UsersService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig) {}

  ngOnInit(): void {
    const user: User | undefined = this.dialogConfig.data?.user;
    this.userForm = this.fb.group({
      id: [user?.id],
      lastName: [user?.lastName, Validators.required],
      firstName: [user?.firstName, Validators.required],
      sex: [user?.sex || Sex.MALE],
      preferredLanguage: [user ? user.preferredLanguage : 'fr'],
      email: [user?.email, [Validators.required, Validators.email]],
      role: [user?.role || UserRole.USER],
    });
    this.roleOptions= [
      { label: this.translateService.instant('users.administrator'), value: UserRole.ADMIN },
      { label: this.translateService.instant('users.manager'), value: UserRole.MANAGER },
      { label: this.translateService.instant('users.standard_user'), value: UserRole.USER },
    ];
    this.sexOptions= [
      { label: this.translateService.instant('common.man'), value: Sex.MALE },
      { label: this.translateService.instant('common.woman'), value: Sex.FEMALE },
    ];
    this.preferredLanguageOptions= [
      { label: this.translateService.instant('common.french'), value: 'fr' },
      { label: this.translateService.instant('common.english'), value: 'en' },
    ];
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      let userFormValue = this.userForm.getRawValue();
      const observable = userFormValue.id > 0 ? this.usersService.update(userFormValue.id, userFormValue) : this.usersService.create(userFormValue);
      observable.subscribe((user: User) => {
        if (user && user.id! > 0) {
          this.dialogRef.close(user);
        }
      });
    }
  }

}
