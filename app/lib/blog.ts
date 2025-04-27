import matter from 'gray-matter';
import { marked } from 'marked';
import fs from 'fs/promises';
import path from 'path';

// Import all markdown files at build time
const blogPosts = import.meta.glob('../data/blog/*.md', {
  eager: true,
  as: 'raw',
});

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
  htmlContent: string;
  published: boolean;
}

export interface BlogPostIndexEntry {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  published: boolean;
}

export async function getBlogIndex(): Promise<BlogPostIndexEntry[]> {
  const index = (await import('../data/blog/blog-index.json')).default;
  return index as BlogPostIndexEntry[];
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const index = await getBlogIndex();
  const posts = await Promise.all(
    index.map(async (indexEntry) => {
      const filepath = `../data/blog/${indexEntry.slug}.md`;
      const content = blogPosts[filepath];

      if (!content) {
        throw new Error(`Blog post not found: ${indexEntry.slug}`);
      }

      // Parse frontmatter and content
      const { content: markdownContent } = matter(content);

      // Convert markdown to HTML
      const htmlContent = await marked(markdownContent);

      return {
        ...indexEntry,
        content: markdownContent,
        htmlContent,
      };
    })
  );

  return posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const index = await getBlogIndex();
  const indexEntry = index.find((post) => post.slug === slug);

  if (!indexEntry) {
    return null;
  }

  const filepath = `../data/blog/${slug}.md`;
  const content = blogPosts[filepath];

  if (!content) {
    return null;
  }

  const { content: markdownContent } = matter(content);
  const htmlContent = await marked(markdownContent);

  return {
    ...indexEntry,
    content: markdownContent,
    htmlContent,
  };
}
