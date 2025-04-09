import { getAllPosts } from '~/lib/blog';
import type { Route } from './+types/blog';
import { Link } from 'react-router';

export async function loader() {
  const posts = await getAllPosts();
  return { posts };
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Blog</h2>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-8">
            <Link to={`/blog/${post.slug}`}>
              <h3 className="text-lg font-semibold">{post.title}</h3>
            </Link>
            <div className="text-muted-foreground">
              {post.date} • {post.tags.join(', ')}
            </div>
            <p className="text-sm text-muted-foreground">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
