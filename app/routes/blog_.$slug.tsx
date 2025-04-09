import type { Route } from './+types/blog_.$slug';
import { getPostBySlug } from '~/lib/blog';

export async function loader({ params }: Route.LoaderArgs) {
  console.log(`Getting post for slug: ${params.slug}`);
  const post = await getPostBySlug(params.slug);

  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }

  return { post };
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const post = loaderData.post;
  return (
    <div className="space-y-6">
      {post && (
        <article>
          <h1 className="text-xl font-semibold">{post.title}</h1>
          <div className="text-gray-600 mb-8">
            {post.date} • {post.tags.join(', ')}
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
        </article>
      )}
    </div>
  );
}
