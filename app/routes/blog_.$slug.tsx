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

export function meta({
  data,
  location,
}: {
  data: { post: { title: string; description: string; date: string; tags: string[] } };
  location: { pathname: string };
}) {
  const url = `https://johneast.dev${location.pathname}`;

  return [
    // Basic SEO
    { title: data.post.title },
    { name: 'description', content: data.post.description },
    { name: 'keywords', content: data.post.tags.join(', ') },
    { name: 'author', content: 'John East' },
    { name: 'robots', content: 'index, follow' },

    // Canonical URL
    { rel: 'canonical', href: url },

    // Article metadata
    { property: 'article:published_time', content: data.post.date },
    { property: 'article:author', content: 'John East' },
    { property: 'article:section', content: 'Blog' },
    ...data.post.tags.map((tag) => ({ property: 'article:tag', content: tag })),

    // Open Graph
    { property: 'og:title', content: data.post.title },
    { property: 'og:description', content: data.post.description },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: 'John East' },

    // Twitter Card
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:title', content: data.post.title },
    { property: 'twitter:description', content: data.post.description },
    { property: 'twitter:creator', content: '@johneast' },

    // Additional SEO
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#ffffff' },
    { name: 'format-detection', content: 'telephone=no' },
  ];
}

export default function BlogPostPage({ loaderData }: Route.ComponentProps) {
  const post = loaderData.post;
  return <div className="space-y-6">{post && <BlogArticle post={post} />}</div>;
}
