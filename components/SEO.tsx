import { Metadata } from 'next';
import Head from 'next/head';

type OpenGraphType = 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  ogType?: OpenGraphType;
  twitterCard?: string;
  children?: React.ReactNode;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogImageUrl = '/images/og-image.jpg', // Default OG image path
  ogType = 'website',
  twitterCard = 'summary_large_image',
  children,
}) => {
  const siteName = 'Your Site Name';
  const siteUrl ='https://sourcecodelelo.com';
  
  return (
    <Head>
      <title>{`${title} | ${siteName}`}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={`${siteUrl}${canonicalUrl}`} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImageUrl}`} />
      <meta property="og:url" content={`${siteUrl}${canonicalUrl || ''}`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImageUrl}`} />
      
      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {children}
    </Head>
  );
};

export const generateMetadata = ({
  title,
  description,
  canonicalUrl,
  ogImageUrl = '/images/og-image.jpg',
  ogType = 'website',
}: SEOProps): Metadata => {
  const siteName = 'Your Site Name';
  const siteUrl = 'https://sourcecodelelo.com';
  
  return {
    title: `${title} | ${siteName}`,
    description,
    metadataBase: new URL(siteUrl),
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonicalUrl || ''}`,
      siteName,
      images: [
        {
          url: ogImageUrl.startsWith('http') ? ogImageUrl : `${siteUrl}${ogImageUrl}`,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: ogType,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl.startsWith('http') ? ogImageUrl : `${siteUrl}${ogImageUrl}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
};

export default SEO;
