import React from "react";
import { getTours } from "@/lib/supabase/tours";
import { createClient } from "@/lib/supabase/server";
import HomePageClient from "./home-client";
import type { Post } from "@/types";

const defaultContent = {
  hero: {
    title: "Let's Make Your Best<br />Trip With Us",
    subtitle:
      "Explore the world with our curated travel packages. Adventure awaits!",
    imageUrl: "https://placehold.co/1920x1080.png",
    imageAlt: "Ancient Egyptian temples",
  },
  whyChooseUs: {
    pretitle: "Why Choose Us",
    title: "Great Opportunity For<br/>Adventure & Travels",
    feature1: {
      title: "Safety First",
      description:
        "We prioritize your safety to ensure you have a worry-free and memorable experience.",
    },
    feature2: {
      title: "Professional Guide",
      description:
        "Our guides are local experts who bring destinations to life with their passion and knowledge.",
    },
    feature3: {
      title: "Exclusive Trip",
      description:
        "We offer unique itineraries and exclusive access to create once-in-a-lifetime journeys.",
    },
  },
  browseCategory: {
    title: "Browse By Destination Category",
    subtitle: "Select a category to see our exclusive tour packages",
  },
  popularDestinations: {
    pretitle: "Top Destinations",
    title: "Popular Tours We Offer",
    count: 6,
  },
  discountBanners: {
    banner1: {
      title: "35% OFF",
      description: "Explore The World tour Hotel Booking.",
    },
    banner2: {
      title: "35% OFF",
      description: "On Flight Ticket Grab This Now.",
    },
  },
  lastMinuteOffers: {
    discount: "50%",
    pretitle: "Deals & Offers",
    title: "Incredible Last-Minute Offers",
    count: 4,
  },
  testimonials: [
    {
      id: "1",
      name: "Brooklyn Simmons",
      role: "Brooklyn Simmons",
      avatar: "https://placehold.co/100x100.png",
      content: "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    },
    {
      id: "2",
      name: "Kristin Watson",
      role: "Web Designer",
      avatar: "https://placehold.co/100x100.png",
      content: "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    },
    {
      id: "3",
      name: "Wade Warren",
      role: "President Of Sales",
      avatar: "https://placehold.co/100x100.png",
      content: "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    },
  ],
  testimonialCount: 6,
  videoSection: {
    pretitle: "Watch Our Story",
    title: "We Provide The Best Tour Facilities",
    backgroundImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    button1Text: "Find Out More",
    button1Link: "/tours",
    button2Text: "Watch Video",
    button2Link: "#",
  },
  newsSection: {
    pretitle: "News & Updates",
    title: "Our Latest News & Articles",
    count: 3,
  },
  visibility: {
    hero: true,
    browseCategory: true,
    whyChooseUs: true,
    popularDestinations: true,
    discountBanners: true,
    lastMinuteOffers: true,
    testimonials: true,
    videoSection: true,
    newsSection: true,
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch tours from Supabase
  const initialTours = await getTours();

  // Fetch home page content from Supabase
  const { data: homePageData } = await supabase
    .from("home_page_content")
    .select("data")
    .eq("id", 1)
    .single();
    
  // Fetch posts/articles from Supabase
  // Try 'articles' first, if not found (error), try 'posts'
  // Actually, based on investigation, 'articles' table doesn't exist, 'posts' exists but is empty.
  // So we'll fetch from 'posts'.
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "Published")
    .order("createdAt", { ascending: false })
    .limit(3);

  const articles = (postsData as unknown as Post[]) || [];

  // Merge fetched content with default content to ensure all fields exist
  const homeContent = homePageData?.data 
    ? { ...defaultContent, ...homePageData.data }
    : defaultContent;

  return (
    <HomePageClient 
      initialTours={initialTours} 
      homeContent={homeContent}
      articles={articles}
    />
  );
}