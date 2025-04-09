import { getAllPosts } from '~/lib/blog';
import type { Route } from './+types/blog';
import BlogIndexEntry from '~/components/blog/blog-index-entry';

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
          <BlogIndexEntry key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
