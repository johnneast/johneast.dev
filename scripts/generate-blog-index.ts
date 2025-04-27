import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';
import type { BlogPostIndexEntry } from '~/lib/blog';

async function generateIndex() {
  const blogDir = path.join(process.cwd(), 'data/blog');
  const files = await fs.readdir(blogDir);

  const index: BlogPostIndexEntry[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
    const { data } = matter(content);

    // Only include published posts (default to true if not specified)
    if (data.published !== false) {
      index.push({
        slug: file.replace('.md', ''),
        title: data.title,
        date: data.date,
        description: data.description,
        tags: data.tags || [],
        published: data.published !== false,
      });
    }
  }

  // Sort by date
  index.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write to public directory
  await fs.writeFile(path.join(process.cwd(), 'public/blog-index.json'), JSON.stringify(index, null, 2));
}

generateIndex();
