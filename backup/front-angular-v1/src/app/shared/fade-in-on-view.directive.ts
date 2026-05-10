import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[fadeInOnView]',
  standalone: true,
})
export class FadeInOnViewDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  /** Quanto da section precisa estar visível pra disparar (0–1). Default 0.2. */
  @Input() fadeInThreshold = 0.2;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('fade-in-init');

    if (typeof IntersectionObserver === 'undefined') {
      // SSR / browser antigo — só revela direto
      node.classList.add('fade-in-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: this.fadeInThreshold },
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
