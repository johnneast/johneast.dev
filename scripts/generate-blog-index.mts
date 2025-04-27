import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface BlogPostIndex {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  published: boolean;
}

async function generateIndex() {
  const blogDir = path.join(__dirname, '..', 'app/data/blog');
  const files = await fs.readdir(blogDir);

  const index: BlogPostIndex[] = [];

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

  // Write to app/public directory
  await fs.writeFile(path.join(__dirname, '..', 'app/data/blog/blog-index.json'), JSON.stringify(index, null, 2));
}

generateIndex();
