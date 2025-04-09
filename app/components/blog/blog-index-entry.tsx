import { Link } from 'react-router';
import type { BlogPost } from '~/lib/blog';
import TagList from './tag-list';

export default function BlogIndexEntry({ post }: { post: BlogPost }) {
  return (
    <article key={post.slug} className="border-b pb-8">
      <Link to={`/blog/${post.slug}`}>
        <h3 className="text-lg font-semibold">{post.title}</h3>
      </Link>
      <TagList tags={post.tags} />
      <p className="text-sm text-muted-foreground">{post.description}</p>
    </article>
  );
}
