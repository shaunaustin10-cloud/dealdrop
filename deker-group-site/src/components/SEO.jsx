import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  name = "De'Shaun Austin", 
  type = "website", 
  image,
  canonical,
  schema // Optional prop for page-specific schema
}) {
  const siteName = "NextHome Mission to Serve";
  const defaultDescription = "Experience excellence in Hampton Roads real estate with De'Shaun Austin. Specialized in luxury homes, investment properties, and personalized service across Norfolk, VA Beach, and Chesapeake.";
  const baseUrl = "https://deker-group.web.app"; 
  const defaultImage = `${baseUrl}/images/hero-modern.jpg`;
  const seoImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : defaultImage;
  const url = canonical || window.location.href;

  // Default Local Business / Real Estate Agent Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "De'Shaun Austin | NextHome Mission to Serve",
    "image": defaultImage,
    "@id": baseUrl,
    "url": baseUrl,
    "telephone": "(757) 912-1644",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hampton Roads", 
      "addressLocality": "Norfolk",
      "addressRegion": "VA",
      "postalCode": "23510",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 36.8508,
      "longitude": -76.2859
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "20:00"
    },
    "sameAs": [
      "https://facebook.com/your-profile",
      "https://instagram.com/your-profile",
      "https://linkedin.com/in/your-profile"
    ]
  };

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name='description' content={description || defaultDescription} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={seoImage} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
}
