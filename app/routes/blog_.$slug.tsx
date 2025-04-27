import BlogArticle from '~/components/blog/blog-article';
import type { Route } from './+types/blog_.$slug';
import { getPostBySlug } from '~/lib/blog';

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }

  return { post };
}

export default function BlogPostPage({ loaderData }: Route.ComponentProps) {
  const post = loaderData.post;
  return <div className="space-y-6">{post && <BlogArticle post={post} />}</div>;
}
