import type { Post } from "@/types";

const authors = ["Admin User", "Guest Writer"];

const generatePosts = (): Post[] => {
  return [
    {
      id: "post-1",
      slug: "a-guide-to-egyptian-cuisine",
      title: "A Guide to Egyptian Cuisine",
      content:
        "Egyptian cuisine is a rich tapestry of flavors influenced by various cultures over thousands of years. From koshari, the national dish, to sweet basbousa, there is something for every palate. This guide explores the must-try dishes for any visitor to Egypt...",
      author: "Admin User",
      status: "Published",
      createdAt: "2024-05-15T10:00:00Z",
      updatedAt: "2024-05-16T11:30:00Z",
      featuredImage:
        "https://images.unsplash.com/photo-1594579124455-5ac835a7d6f6?q=80&w=2070&auto=format&fit=crop",
      tags: ["Food", "Culture", "Egypt"],
    },
    {
      id: "post-2",
      slug: "navigating-cairos-khan-el-khalili",
      title: "Navigating Cairo's Khan el-Khalili Bazaar",
      content:
        "Khan el-Khalili is one of the world's oldest and most famous bazaars. This sprawling market is a labyrinth of narrow alleys packed with shops selling everything from spices and perfumes to intricate metalwork and handmade crafts. Here are our tips for navigating this chaotic and wonderful place...",
      author: "Guest Writer",
      status: "Published",
      createdAt: "2024-06-02T14:20:00Z",
      updatedAt: "2024-06-02T14:20:00Z",
      featuredImage:
        "https://images.unsplash.com/photo-1616869806497-65778f459b35?q=80&w=1974&auto=format&fit=crop",
      tags: ["Destinations", "Travel Tips", "Egypt"],
    },
    {
      id: "post-3",
      slug: "packing-for-your-nile-cruise",
      title: "What to Pack for Your Nile Cruise",
      content:
        "A Nile cruise is a trip of a lifetime, but packing for it can be tricky. You need to be prepared for hot days exploring temples and cool evenings on the river. Our essential packing list covers everything you need for a comfortable and stylish journey through ancient Egypt.",
      author: "Admin User",
      status: "Draft",
      createdAt: "2024-06-10T09:00:00Z",
      updatedAt: "2024-06-11T16:45:00Z",
      featuredImage:
        "https://images.unsplash.com/photo-1552596455-1f6c44244246?q=80&w=2070&auto=format&fit=crop",
      tags: ["Travel Tips"],
    },
    {
      id: "post-4",
      slug: "diving-in-the-red-sea",
      title: "Diving in the Red Sea: A Beginner's Guide",
      content:
        "The Red Sea is one of the top diving destinations in the world, renowned for its vibrant coral reefs and diverse marine life. This guide is for beginners looking to take their first plunge. We cover the best spots, what to expect, and how to get certified.",
      author: "Guest Writer",
      status: "Published",
      createdAt: "2024-04-25T18:00:00Z",
      updatedAt: "2024-04-25T18:00:00Z",
      featuredImage:
        "https://images.unsplash.com/photo-1607595304128-2d5b6a7e6c0c?q=80&w=2070&auto=format&fit=crop",
      tags: ["Adventure", "Destinations"],
    },
  ];
};

const posts = generatePosts();

export const getPosts = (): Post[] => posts;
export const getPostBySlug = (slug: string): Post | undefined =>
  posts.find((p) => p.slug === slug);
export const getAuthors = (): string[] => authors;
