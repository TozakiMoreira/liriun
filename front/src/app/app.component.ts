import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoadingBarComponent } from './shared/loading-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  private readonly brand = 'Liriun';

  title = 'front';

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const titulo = this.coletarTituloMaisProfundo(this.activatedRoute);
        this.titleService.setTitle(titulo ? `${this.brand} — ${titulo}` : this.brand);
      });
  }

  private coletarTituloMaisProfundo(route: ActivatedRoute): string | null {
    let atual: ActivatedRoute | null = route;
    let titulo: string | null = null;
    while (atual) {
      const t = atual.snapshot.data?.['titulo'];
      if (typeof t === 'string' && t.length > 0) {
        titulo = t;
      }
      atual = atual.firstChild;
    }
    return titulo;
  }
}
