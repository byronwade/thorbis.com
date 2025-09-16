import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thorbis.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/_next/',
          '/static/',
          '/dashboards/*/settings',
          '/dashboards/*/billing',
          '/search',
          '/tmp/',
          '*.pdf',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: [
          '/blog/',
          '/docs/', 
          '/about',
          '/pricing',
          '/contact'
        ],
        disallow: [
          '/dashboards/',
          '/api/',
          '/admin/',
          '/private/'
        ]
      },
      {
        userAgent: 'Google-Extended',
        allow: [
          '/blog/',
          '/docs/',
          '/about',
          '/pricing'
        ],
        disallow: [
          '/dashboards/',
          '/api/',
          '/admin/',
          '/private/'
        ]
      }
    ],
    sitemap: '${baseUrl}/sitemap.xml',
    host: baseUrl
  }
}