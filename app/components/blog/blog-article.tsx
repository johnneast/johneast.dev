import type { BlogPost } from '~/lib/blog';
import TagList from './tag-list';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { ChevronLeft } from 'lucide-react';

export default function BlogArticle({ post }: { post: BlogPost }) {
  return (
    <article>
      <div className="mb-6">
        <Link to="/blog">
          <Button className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Blog Posts
          </Button>
        </Link>
      </div>
      <h1 className="text-xl font-semibold">{post.title}</h1>
      <div className="text-muted-foreground">{post.date}</div>
      <TagList tags={post.tags} />
      <div
        className="mt-8 prose max-w-none [&>p]:my-6 [&>blockquote]:italic [&>blockquote]:pl-4 [&>blockquote]:border-l-2 [&>blockquote]:border-primary/30 [&>blockquote]:text-primary/70 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h4]:font-bold [&_h5]:font-bold [&_h6]:font-bold"
        dangerouslySetInnerHTML={{ __html: post.htmlContent }}
      />
    </article>
  );
}
