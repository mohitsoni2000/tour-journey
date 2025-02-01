// footer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  CommonService,
  UserDetails,
} from '../../service/common/common.service';
import { FooterService } from '../../service/footer/footer.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { filter, finalize } from 'rxjs';
import { HeaderService } from '../../service/header/header.service';

interface FooterSection {
  title: string;
  links: Array<{
    text: string;
    url: string;
    isHighlighted?: boolean;
  }>;
}
interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

interface Destination {
  name: string;
  imageUrl: string;
  url: string;
  overlayText?: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  socialLinks: SocialLink[];

  footerSections: FooterSection[] = [
    {
      title: 'ABOUT Vinay Ashija',
      links: [
        { text: 'About Us', url: 'https://journeybees.in/page/about-us' },
        { text: 'Blog', url: 'https://journeybees.in/news' },
        {
          text: 'Terms & Conditions',
          url: 'https://journeybees.in/page/terms-and-conditions',
        },
        {
          text: 'Privacy Policies',
          url: 'https://journeybees.in/page/privacy-policy',
        },
        { text: 'Support', url: 'https://journeybees.in/contact' },
      ],
    },
    {
      title: 'FOR SUPPLIERS',
      links: [{ text: 'List Your Activities', url: 'javascript:void(0)' }],
    },
    {
      title: 'FOR BRANDS',
      links: [
        { text: 'Partner With Us', url: 'javascript:void(0)' },
        { text: 'Destination Marketing', url: 'javascript:void(0)' },
      ],
    },
    {
      title: 'FOR TRAVELLERS',
      links: [{ text: 'Gift an Experience', url: 'javascript:void(0)' }],
    },
  ];

  destinations: Destination[] = [];
  popularActivities: string[] = [];
  internationalDestinations: string[] = [];
  isLoading = true;

  userDeatils: UserDetails;

  constructor(
    private commonService: CommonService,
    private footerService: FooterService,
    private headerService: HeaderService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userDeatils = this.commonService.getUserDetails();
    this.socialLinks = [
      {
        icon: 'ri-facebook-fill',
        url: this.userDeatils.facebook,
        label: 'Facebook',
      },
      {
        icon: 'ri-instagram-fill',
        url: this.userDeatils.instagram,
        label: 'Instagram',
      },
      {
        icon: 'ri-twitter-fill',
        url: this.userDeatils.twitter,
        label: 'Twitter',
      },
    ];
  }

  ngOnInit() {
    this.loadDestinations();
    this.initializeAnimations();
  }

  private loadDestinations() {
    this.isLoading = true;
    this.headerService
      .fetchLocations()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          if (response?.success && response?.data) {
            this.processDestinationData(response.data);
          }
        },
        error: (error) => {
          console.error('Error loading destinations:', error);
          this.isLoading = false;
        },
      });
  }

  private processDestinationData(data: any[]) {
    // Transform API data into destination format
    this.destinations = data
      .filter((item) => item.image_id && item.status === 'publish')
      .map((item) => ({
        name: item.name.toUpperCase(),
        imageUrl: `https://journeybees.in/uploads/${item.file_path}`,
        url: `${item.slug}`,
        overlayText: `Explore ${item.name}`,
      }))
      .slice(0, 15); // Limit to 6 destinations

  }

  private initializeAnimations() {
    // Add animate.css classes to elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              'animate__animated',
              'animate__fadeInUp'
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  selectDestination(destination: Destination) {
    // Navigate to new route
    this.router
      .navigate(['/tour', destination.url], {
        skipLocationChange: false,
        replaceUrl: false,
      })
      .then(() => {
        // Force route refresh by subscribing to NavigationEnd
        this.router.events
          .pipe(filter((event) => event instanceof NavigationEnd))
          .subscribe(() => {
            window.scrollTo(0, 0); // Scroll to top after navigation
          });
      });
  }
}
