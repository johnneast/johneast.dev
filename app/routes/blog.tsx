import { getBlogIndex } from '~/lib/blog';
import type { Route } from './+types/blog';
import BlogIndexEntry from '~/components/blog/blog-index-entry';

export async function loader() {
  const blogIndex = await getBlogIndex();
  return { blogIndex };
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { blogIndex } = loaderData;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Blog</h2>
      <div className="space-y-8">
        {blogIndex.map((indexEntry) => (
          <BlogIndexEntry key={indexEntry.slug} indexEntry={indexEntry} />
        ))}
      </div>
    </div>
  );
}
