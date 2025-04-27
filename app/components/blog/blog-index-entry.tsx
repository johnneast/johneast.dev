import { Link } from 'react-router';
import type { BlogPostIndexEntry } from '~/lib/blog';
import TagList from './tag-list';

export default function BlogIndexEntry({ indexEntry }: { indexEntry: BlogPostIndexEntry }) {
  return (
    <article key={indexEntry.slug} className="border-b pb-8">
      <Link to={`/blog/${indexEntry.slug}`}>
        <h3 className="text-lg font-semibold">{indexEntry.title}</h3>
      </Link>
      <div className="text-muted-foreground">{indexEntry.date}</div>
      <TagList tags={indexEntry.tags} />
      <p className="text-sm text-muted-foreground">{indexEntry.description}</p>
    </article>
  );
}
