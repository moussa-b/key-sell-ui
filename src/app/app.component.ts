import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Toast } from 'primeng/toast';
import { ToasterService } from './core/services/toaster.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToasterMessage } from './core/models/toaster-message.model';
import { LoadingIndicatorComponent } from './core/components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'ks-root',
  imports: [RouterOutlet, FormsModule, Toast, LoadingIndicatorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService]
})
export class AppComponent implements OnInit, OnDestroy {
  private eventSubscription!: Subscription;

  constructor(private translateService: TranslateService,
              private messageService: MessageService,
              private toasterService: ToasterService) {
    this.translateService.addLangs(['fr', 'en']);
    this.translateService.setDefaultLang('fr');
    this.translateService.use('fr');
  }

  ngOnInit(): void {
    this.eventSubscription = this.toasterService.toasterEvent$.subscribe(
      (message: ToasterMessage) => {
        this.messageService.add(message);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }
}
