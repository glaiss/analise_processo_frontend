import { Component, OnInit, PLATFORM_ID, signal, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);
  showMenu = true;

  readonly isMobile = signal(false);
  readonly isSidenavOpen = signal(false);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.auth.checkSession().subscribe(() => {
        this.auth.checkImpersonation().subscribe();
      });

      this.breakpointObserver
        .observe(['(max-width: 768px)'])
        .subscribe(state => {
          this.isMobile.set(state.matches);
          if (!state.matches) {
            this.isSidenavOpen.set(false);
          }
        });
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        this.showMenu = !event.url.includes('/login');
        if (this.isMobile()) {
          this.isSidenavOpen.set(false);
        }
        if (isPlatformBrowser(this.platformId)) {
          this.auth.checkImpersonation().subscribe();
          window.scrollTo(0, 0);
        }
      },
      error: () => {}
    });
  }

  toggleSidenav() {
    this.isSidenavOpen.update(value => !value);
  }
}
