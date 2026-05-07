import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LocaleService } from './core/locale/locale.service';
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
  private readonly locale = inject(LocaleService);

  private readonly brand = 'Liriun';
  private readonly tituloKey = signal<string | null>(null);

  title = 'front';

  constructor() {
    effect(() => {
      const key = this.tituloKey();
      const _ = this.locale.locale();
      const titulo = key ? this.locale.t(key) : null;
      this.titleService.setTitle(titulo ? `${this.brand} — ${titulo}` : this.brand);
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.tituloKey.set(this.coletarTituloKeyMaisProfundo(this.activatedRoute));
      });
  }

  private coletarTituloKeyMaisProfundo(route: ActivatedRoute): string | null {
    let atual: ActivatedRoute | null = route;
    let key: string | null = null;
    while (atual) {
      const k = atual.snapshot.data?.['tituloKey'];
      if (typeof k === 'string' && k.length > 0) {
        key = k;
      }
      atual = atual.firstChild;
    }
    return key;
  }
}
