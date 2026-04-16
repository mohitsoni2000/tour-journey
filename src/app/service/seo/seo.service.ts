// seo.service.ts
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TransformedTour } from '../tour/tour.service';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private doc = inject(DOCUMENT);

  private readonly siteName = 'JourneyBees';
  private readonly defaultImage = 'assets/images/default-og-image.jpg';
  private readonly twitterHandle = '@journeybees';

  updateTourSeo(tour: TransformedTour) {
    this.updateBasicSeo(tour);
    this.updateOpenGraph(tour);
    this.updateTwitterCard(tour);
    this.updateStructuredData(tour);
  }

  private updateBasicSeo(tour: TransformedTour) {
    // Generate a compelling title with proper length
    const titleText = this.generateTourTitle(tour);
    this.title.setTitle(titleText);

    // Generate a descriptive meta description
    const description = this.generateTourDescription(tour);
    this.meta.updateTag({ name: 'description', content: description });

    // Add relevant keywords
    const keywords = this.generateTourKeywords(tour);
    this.meta.updateTag({ name: 'keywords', content: keywords });

    // M1: canonical URL must be a <link> element, not a <meta> tag
    this.updateCanonical(`${this.doc.location.origin}${this.router.url}`);

    // Set language
    this.meta.updateTag({ 
      'http-equiv': 'content-language', 
      content: 'en' 
    });

    // Set robots meta
    this.meta.updateTag({ 
      name: 'robots', 
      content: 'index, follow' 
    });
  }

  private updateOpenGraph(tour: TransformedTour) {
    const description = this.generateTourDescription(tour);
    const ogTags = [
      { property: 'og:title', content: this.generateTourTitle(tour) },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `${this.doc.location.origin}${this.router.url}` },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: tour.images[0] || this.defaultImage },
      { property: 'og:image:alt', content: `${tour.title} Tour Package` },
      { property: 'og:site_name', content: this.siteName },
      { property: 'og:locale', content: 'en_US' },
      // Price information
      { property: 'og:price:amount', content: tour.salePrice.toString() },
      { property: 'og:price:currency', content: 'INR' }
    ];

    ogTags.forEach(tag => this.meta.updateTag(tag));
  }

  private updateTwitterCard(tour: TransformedTour) {
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: this.twitterHandle },
      { name: 'twitter:title', content: this.generateTourTitle(tour) },
      { name: 'twitter:description', content: this.generateTourDescription(tour) },
      { name: 'twitter:image', content: tour.images[0] || this.defaultImage },
      { name: 'twitter:image:alt', content: `${tour.title} Tour Package` }
    ];

    twitterTags.forEach(tag => this.meta.updateTag(tag));
  }

  private updateStructuredData(tour: TransformedTour) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: tour.title,
      description: tour.description,
      touristType: ['Leisure', 'Sightseeing'],
      audience: {
        '@type': 'Audience',
        audienceType: 'Everyone'
      },
      provider: {
        '@type': 'Organization',
        name: this.siteName,
        url: this.doc.location.origin
      },
      offers: {
        '@type': 'Offer',
        price: tour.salePrice,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString()
      },
      image: tour.images.map(img => ({
        '@type': 'ImageObject',
        url: img,
        width: '800',
        height: '600'
      })),
      itinerary: {
        '@type': 'ItemList',
        itemListElement: tour.highlights.map((highlight, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'TouristDestination',
            name: highlight
          }
        }))
      },
      areaServed: {
        '@type': 'City',
        name: tour.location
      },
      subjectOf: {
        '@type': 'CreativeWork',
        abstract: tour.description
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Duration',
          value: tour.duration
        }
      ]
    };

    // M2: use injected DOCUMENT instead of global document (SSR-compatible)
    const existingSchema = this.doc.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  private generateTourTitle(tour: TransformedTour): string {
    const titleParts = [
      tour.title,
      tour.location,
      `${tour.duration} Tour Package`,
      this.siteName
    ];
    return titleParts.join(' | ');
  }

  private generateTourDescription(tour: TransformedTour): string {
    const highlightsList = tour.highlights.slice(0, 3).join(', ');
    return `Experience ${tour.title} for ${tour.duration}. Starting at ₹${tour.salePrice}. Highlights: ${highlightsList}. Book your ${tour.location} tour package with ${this.siteName} today!`.slice(0, 155) + '...';
  }

  private generateTourKeywords(tour: TransformedTour): string {
    const baseKeywords = [
      tour.title,
      tour.location,
      'tour package',
      'travel',
      'tourism',
      tour.duration,
      ...tour.cities,
      ...tour.highlights.slice(0, 5),
      this.siteName
    ];

    return baseKeywords
      .filter(Boolean)
      .map(keyword => keyword.toLowerCase())
      .join(', ');
  }

  removeAllMeta() {
    // Remove Open Graph tags
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:image"');

    // Remove Twitter tags
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:image"');

    // Remove structured data
    const existingSchema = this.doc.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
      existingSchema.remove();
    }
  }

  // M1: proper canonical <link> tag management (not a <meta> tag)
  private updateCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}