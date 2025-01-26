import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Banner } from '../../../../service/tour/tour.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [],
  template: ` <div
    class="promotion-banner"
    [style.background-image]="'url(' + banner.backgroundImage + ')'"
  >
    <div class="banner-content">
      <h2>{{ banner.title }}</h2>
      <p>{{ banner.subtitle }}</p>
      <button class="cta-button">{{ banner.ctaText }}</button>
    </div>
  </div>`,
  styleUrl: './banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerComponent {
  @Input() banner!: Banner;
}
