import { MetadataRoute } from 'next'
import { generateNextJSSitemap } from '@/lib/sitemap-generation'

export default function sitemap(): MetadataRoute.Sitemap {
  return generateNextJSSitemap()
}