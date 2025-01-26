import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-call-button',
  standalone: true,
  imports: [],
  templateUrl: './call-button.component.html',
  styleUrl: './call-button.component.css',
  animations: [
    trigger('buttonContainer', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(100%)' })
        ),
      ]),
    ]),

    trigger('buttonAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate(
          '400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
    ]),
  ],
})
export class CallButtonComponent implements OnInit, OnDestroy {
  @Input() phoneNumber: string = '';
  @Output() callRequested = new EventEmitter<void>();

  isMobile: boolean = false;
  isCallNowPulsing: boolean = false;
  isCallbackPulsing: boolean = false;
  private resizeListener: () => void;
  private pulseInterval: any;

  constructor() {
    this.resizeListener = () => this.checkIfMobile();
  }

  ngOnInit() {
    this.checkIfMobile();
    window.addEventListener('resize', this.resizeListener);
    this.startPulseAnimation();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
    }
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  private startPulseAnimation() {
    this.pulseInterval = setInterval(() => {
      // Alternate pulsing between buttons
      this.isCallNowPulsing = !this.isCallNowPulsing;
      setTimeout(() => {
        this.isCallbackPulsing = !this.isCallbackPulsing;
      }, 2000);
    }, 4000);
  }

  onCallRequest() {
    this.callRequested.emit();
    // Add visual feedback
    this.isCallbackPulsing = true;
    setTimeout(() => {
      this.isCallbackPulsing = false;
    }, 1000);
  }
}
