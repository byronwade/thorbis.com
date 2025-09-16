import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'

const contentDirectory = path.join(process.cwd(), 'src/content')

export interface MDXFrontMatter {
  title: string
  description?: string
  version?: string
  lastModified?: string
  author?: string
  tags?: string[]
}

export interface MDXContent {
  slug: string
  frontMatter: MDXFrontMatter
  content: string
  headings: Heading[]
}

export interface Heading {
  id: string
  text: string
  level: number
}

// Get all spec versions
export function getSpecVersions(): string[] {
  const specDir = path.join(contentDirectory, 'spec')
  
  if (!fs.existsSync(specDir)) {
    return []
  }
  
  return fs
    .readdirSync(specDir)
    .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    .map(file => file.replace(/[^\w\s-]/g, ''))
    .sort((a, b) => {
      // Sort versions (v1.0, v1.1, etc.)
      const aVersion = a.replace('v', '').split('.').map(Number)
      const bVersion = b.replace('v', '').split('.').map(Number)
      
      for (const i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
        const aPart = aVersion[i] || 0
        const bPart = bVersion[i] || 0
        
        if (aPart !== bPart) {
          return bPart - aPart // Descending order (newest first)
        }
      }
      
      return 0
    })
}

// Get spec content by version
export async function getSpecByVersion(version: string): Promise<MDXContent | null> {
  const specPath = path.join(contentDirectory, 'spec', '${version}.md')
  
  if (!fs.existsSync(specPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(specPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // Process markdown
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content)
  
  const contentHtml = processedContent.toString()
  
  // Extract headings for navigation
  const headings = extractHeadings(content)
  
  return {
    slug: version,
    frontMatter: data as MDXFrontMatter,
    content: contentHtml,
    headings
  }
}

// Get all blog posts
export function getBlogPosts(): MDXContent[] {
  const blogDir = path.join(contentDirectory, 'blog')
  
  if (!fs.existsSync(blogDir)) {
    return []
  }
  
  const filenames = fs.readdirSync(blogDir)
  const posts = filenames
    .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    .map(filename => {
      const filePath = path.join(blogDir, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        slug: filename.replace(/[^\w\s-]/g, ''),
        frontMatter: data as MDXFrontMatter,
        content,
        headings: extractHeadings(content)
      }
    })
  
  // Sort posts by date (newest first)
  return posts.sort((a, b) => {
    const dateA = new Date(a.frontMatter.lastModified || '1970-01-01')
    const dateB = new Date(b.frontMatter.lastModified || '1970-01-01')
    return dateB.getTime() - dateA.getTime()
  })
}

// Get blog post by slug
export async function getBlogPost(slug: string): Promise<MDXContent | null> {
  const blogPath = path.join(path.join(contentDirectory, 'blog',, 'blog', '${slug}.md')
  
  if (!fs.existsSync(blogPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(blogPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // Process markdown
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content)
  
  const contentHtml = processedContent.toString()
  
  return {
    slug,
    frontMatter: data as MDXFrontMatter,
    content: contentHtml,
    headings: extractHeadings(content)
  }
}

// Get single page content (like FAQ, Trust, etc.)
export async function getPageContent(page: string): Promise<MDXContent | null> {
  const pagePath = path.join(contentDirectory, '${page}.md')
  
  if (!fs.existsSync(pagePath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(pagePath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // Process markdown
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content)
  
  const contentHtml = processedContent.toString()
  
  return {
    slug: page,
    frontMatter: data as MDXFrontMatter,
    content: contentHtml,
    headings: extractHeadings(content)
  }
}

// Extract headings from markdown content
function extractHeadings(content: string): Heading[] {
  const headingRegex = /^#{1,6}\s+(.+)$/gm
  const headings: Heading[] = []
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[0].match(/^#+/)?.[0].length || 1
    const text = match[1].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
    
    headings.push({ id, text, level })
  }
  
  return headings
}

// Generate table of contents from headings
export function generateTOC(headings: Heading[]): string {
  if (headings.length === 0) return ''
  
  const toc = '<nav class="toc">
<ul>
'
  
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1)
    toc += '${indent}<li><a href="#${heading.id}">${heading.text}</a></li>
'
  })
  
  toc += '</ul>
</nav>'
  return toc
}

// Get content by slug (generic content loader)
export async function getContentBySlug(slug: string): Promise<MDXContent | null> {
  const contentPath = path.join(contentDirectory, '${slug}.md')
  
  if (!fs.existsSync(contentPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(contentPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // Process markdown
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content)
  
  const contentHtml = processedContent.toString()
  
  return {
    slug: slug.split('/').pop() || slug,
    frontMatter: data as MDXFrontMatter,
    content: contentHtml,
    headings: extractHeadings(content)
  }
}

// Get latest spec version
export function getLatestSpecVersion(): string {
  const versions = getSpecVersions()
  return versions[0] || 'v1.0'
}