import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  private readonly router = inject(Router);

  constructor() {
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
