import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/supabase/blog";

type Props = { params: { slug: string } };

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  return (
    <article className="container mx-auto py-10 prose prose-neutral dark:prose-invert">
      <h1>{post.title}</h1>
      <p className="text-sm text-muted-foreground">
        By {post.author} · {new Date(post.createdAt).toLocaleDateString()} · {post.status}
      </p>
      {post.featuredImage && (
        <div className="relative w-full h-80 my-6">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div>
        {post.content}
      </div>
    </article>
  );
}