import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

@Component({
  selector: 'ks-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.scss'],
  imports: [AsyncPipe, NgTemplateOutlet],
  standalone: true,
})
export class LoadingIndicatorComponent implements OnInit {
  @Input() detectRouteTransitions = false;
  @ContentChild('loading') customLoadingIndicator: TemplateRef<any> | null = null;
  loading$: Observable<boolean>;

  constructor(private loadingService: LoadingService,
              private router: Router) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    if (this.detectRouteTransitions) {
      this.router.events
        .pipe(
          tap((event) => {
            if (event instanceof RouteConfigLoadStart) {
              this.loadingService.loadingOn();
            } else if (event instanceof RouteConfigLoadEnd) {
              this.loadingService.loadingOff();
            }
          })
        )
        .subscribe();
    }
  }
}
