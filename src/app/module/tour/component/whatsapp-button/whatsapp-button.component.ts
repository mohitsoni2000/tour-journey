import { trigger, transition, style, animate, state } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-button.component.html',
  styleUrl: './whatsapp-button.component.css',
  animations: [
    trigger('buttonContainer', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),

    trigger('pulseAnimation', [
      state('pulse', style({ transform: 'scale(1)' })),
      state('noPulse', style({ transform: 'scale(1)' })),
      transition('pulse <=> noPulse', [
        animate('1000ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1.1)' })),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)' }))
      ])
    ]),

    trigger('scaleHover', [
      state('default', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.1)' })),
      transition('default <=> hovered', 
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),

    trigger('iconAnimation', [
      state('default', style({ transform: 'rotate(0deg)' })),
      state('hovered', style({ transform: 'rotate(360deg)' })),
      transition('default <=> hovered', 
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),

    trigger('tooltipAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class WhatsappButtonComponent {
  @Input() phoneNumber: string = '';
  isPulsing: boolean = false;
  isHovered: boolean = false;
  showTooltip: boolean = false;
  private pulseInterval: any;

  ngOnInit() {
    this.startPulseAnimation();
    // Show tooltip briefly on initial load
    setTimeout(() => {
      this.showTooltip = true;
      setTimeout(() => {
        this.showTooltip = false;
      }, 3000);
    }, 1500);
  }

  ngOnDestroy() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
    }
  }

  private startPulseAnimation() {
    this.pulseInterval = setInterval(() => {
      this.isPulsing = true;
      setTimeout(() => {
        this.isPulsing = false;
      }, 1500);
    }, 5000);
  }

  onHover(isHovered: boolean) {
    this.isHovered = isHovered;
  }
}
