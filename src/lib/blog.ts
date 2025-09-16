import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const blogDirectory = path.join(process.cwd(), 'src/content/blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  author: string
  date: string
  category: string
  tags: string[]
  featured: boolean
  content: string
  readingTime: number
}

export interface BlogFrontMatter {
  title: string
  description: string
  author: string
  date: string
  category: string
  tags: string[]
  featured?: boolean
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(blogDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(blogDirectory).filter(name => name.endsWith('.md'))
  
  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/[^\w\s-]/g, '')
      const post = await getBlogPostBySlug(slug)
      return post
    })
  )

  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(blogDirectory, '${slug}.md')
    
    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const frontMatter = data as BlogFrontMatter

    // Process markdown content
    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content)

    const contentHtml = processedContent.toString()

    return {
      slug,
      title: frontMatter.title,
      description: frontMatter.description,
      author: frontMatter.author,
      date: frontMatter.date,
      category: frontMatter.category,
      tags: frontMatter.tags || [],
      featured: frontMatter.featured || false,
      content: contentHtml,
      readingTime: calculateReadingTime(content)
    }
  } catch (error) {
    console.error('Error reading blog post ${slug}:', error)
    return null
  }
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(post => post.featured).slice(0, 3)
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(post => post.category.toLowerCase() === category.toLowerCase())
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

export function getAllCategories(): Promise<string[]> {
  return getAllBlogPosts().then(posts => {
    const categories = posts.map(post => post.category)
    return Array.from(new Set(categories)).sort()
  })
}

export function getAllTags(): Promise<string[]> {
  return getAllBlogPosts().then(posts => {
    const tags = posts.flatMap(post => post.tags)
    return Array.from(new Set(tags)).sort()
  })
}