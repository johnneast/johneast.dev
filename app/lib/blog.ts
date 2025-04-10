import matter from 'gray-matter';
import { marked } from 'marked';
import { format } from 'date-fns';
import { UTCDate } from '@date-fns/utc';

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
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    Object.entries(blogPosts).map(async ([filepath, content]) => {
      // Get slug from filepath
      const slug = filepath.replace('../data/blog/', '').replace('.md', '');

      // Parse frontmatter and content
      const { data, content: markdownContent } = matter(content);

      // Convert markdown to HTML
      const htmlContent = await marked(markdownContent);

      return {
        slug,
        title: data.title,
        date: format(new UTCDate(data.date), 'MMMM d, yyyy'),
        description: data.description,
        tags: data.tags,
        content: markdownContent,
        htmlContent,
      };
    })
  );

  // Sort posts by filename (which should be YYYY-MM-DD)
  return posts.sort((a, b) => {
    return b.slug.localeCompare(a.slug);
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) || null;
}
