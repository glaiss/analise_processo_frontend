import { Component, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
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
  showMenu = true;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.auth.checkSession().subscribe(() => {
        this.auth.checkImpersonation().subscribe();
      });
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        this.showMenu = !event.url.includes('/login');
        if (isPlatformBrowser(this.platformId)) {
          this.auth.checkImpersonation().subscribe();
          window.scrollTo(0, 0);
        }
      },
      error: () => {}
    });
  }

  toggleSidenav() {
    if (this.sidenav) {
      void this.sidenav.toggle();
    }
  }
}
