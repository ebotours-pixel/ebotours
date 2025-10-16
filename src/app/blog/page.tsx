import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/supabase/blog";

export default async function BlogListPage() {
  const posts = await getPosts();
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-lg border bg-card">
              {post.featuredImage && (
                <div className="relative w-full h-40">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-sm text-muted-foreground">
                  By {post.author} · {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground line-clamp-3">
                  {post.content}
                </p>
                <Link href={`/blog/${post.slug}`} className="text-primary">
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}