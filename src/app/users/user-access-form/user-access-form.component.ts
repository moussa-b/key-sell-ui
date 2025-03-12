import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserAccessConfiguration } from '../dto/user-access.configuration';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserAccess } from '../../core/models/user-access.model';
import { Button } from 'primeng/button';

@Component({
  selector: 'ks-user-access-form',
  imports: [
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    ToggleSwitch,
    ReactiveFormsModule,
    Button,
    TranslatePipe
  ],
  templateUrl: './user-access-form.component.html',
})
export class UserAccessFormComponent implements OnInit {
  userAccessConfiguration?: UserAccessConfiguration;
  userAccessForm = new FormGroup({});
  private userId!: number;

  constructor(private usersService: UsersService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.userId = this.dialogConfig.data!.userId;
    this.usersService.getUserAccessConfiguration(this.userId).subscribe((userAccessConfiguration: UserAccessConfiguration) => {
      this.userAccessConfiguration = userAccessConfiguration;
      if (userAccessConfiguration.userAccess && userAccessConfiguration.groups.length > 0) {
        for (const group of userAccessConfiguration.groups) {
          for (const field of group.fields) {
            const control = field.value as keyof UserAccess;
            this.userAccessForm.addControl(control, this.fb.control(userAccessConfiguration.userAccess[control]));
          }
        }
      }
    });
  }

  onSubmit(): void {
    this.usersService.updateUserAccess(this.userId, this.userAccessForm.getRawValue() as UserAccess).subscribe(() => {
      this.dialogRef.close(true);
    });
  }
}
