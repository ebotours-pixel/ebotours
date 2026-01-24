/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PlusCircle, Trash2, Layout, Image as ImageIcon, MapPin, Tag, Video, Newspaper, MessageSquare, Eye, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/image-uploader";
import Image from "next/image";
import { browseCategoryIconKeys } from "@/types";
import type { BrowseCategoryItem, HomeContent } from "@/types";
import { Separator } from "@/components/ui/separator";
import { updateHomePageContent } from "@/lib/supabase/agency-content";

const defaultBrowseCategories: BrowseCategoryItem[] = [];

const defaultHomePageData = {
  hero: {
    title: "",
    subtitle: "",
    imageUrl: "",
    imageAlt: "",
  },
  whyChooseUs: {
    pretitle: "",
    title: "",
    imageUrl: "",
    imageAlt: "",
    badgeValue: "",
    badgeLabel: "",
    feature1: {
      title: "",
      description: "",
    },
    feature2: {
      title: "",
      description: "",
    },
    feature3: {
      title: "",
      description: "",
    },
  },
  browseCategory: {
    title: "",
    subtitle: "",
    categories: defaultBrowseCategories,
  },
  popularDestinations: {
    pretitle: "",
    title: "",
    count: 0,
  },
  discountBanners: {
    banner1: {
      title: "",
      description: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
    },
    banner2: {
      title: "",
      description: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
    },
  },
  lastMinuteOffers: {
    discount: "",
    pretitle: "",
    title: "",
    count: 0,
  },
  testimonials: [],
  testimonialCount: 0,
  videoSection: {
    pretitle: "",
    title: "",
    backgroundImageUrl: "",
    button1Text: "",
    button1Link: "",
    button2Text: "",
    button2Link: "",
  },
  newsSection: {
    pretitle: "",
    title: "",
    count: 0,
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

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  avatar: z.string().url("Must be a valid URL").or(z.literal("")),
  content: z.string().min(10, "Testimonial text is too short"),
});

const featureSchema = z.object({
  title: z.string().min(1, "Feature title is required"),
  description: z.string().min(1, "Feature description is required"),
});

const browseCategoryItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.string().min(1, "Type is required"),
  icon: z.enum(browseCategoryIconKeys),
});

// Safe File check for SSR
const fileSchema =
  typeof window !== "undefined" && typeof File !== "undefined"
    ? z.instanceof(File)
    : z.any();

const formSchema = z.object({
  hero: z.object({
    title: z.string().min(1, "Hero title is required"),
    subtitle: z.string().min(1, "Hero subtitle is required"),
    image: z.array(fileSchema).optional(),
    imageAlt: z.string().optional(),
  }),
  whyChooseUs: z.object({
    pretitle: z.string().min(1, "Pre-title is required"),
    title: z.string().min(1, "Title is required"),
    image: z.array(fileSchema).optional(),
    imageAlt: z.string().optional(),
    badgeValue: z.string().optional(),
    badgeLabel: z.string().optional(),
    feature1: featureSchema,
    feature2: featureSchema,
    feature3: featureSchema,
  }),
  browseCategory: z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    categories: z.array(browseCategoryItemSchema).optional(),
  }),
  popularDestinations: z.object({
    pretitle: z.string().optional(),
    title: z.string().optional(),
    count: z.coerce.number().min(3).max(12).optional(),
  }),
  discountBanners: z.object({
    banner1: z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      image: z.array(fileSchema).optional(),
      buttonText: z.string().optional(),
      buttonLink: z.string().optional(),
    }),
    banner2: z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      image: z.array(fileSchema).optional(),
      buttonText: z.string().optional(),
      buttonLink: z.string().optional(),
    }),
  }),
  lastMinuteOffers: z.object({
    discount: z.string().min(1, "Discount is required"),
    pretitle: z.string().min(1, "Pre-title is required"),
    title: z.string().min(1, "Title is required"),
    count: z.coerce.number().min(2).max(10).optional(),
  }),
  testimonials: z.array(testimonialSchema),
  testimonialCount: z.coerce.number().min(1).max(20).optional(),
  videoSection: z.object({
    pretitle: z.string().min(1, "Pre-title is required"),
    title: z.string().min(1, "Title is required"),
    backgroundImage: z.array(fileSchema).optional(),
    button1Text: z.string().optional(),
    button1Link: z.string().optional(),
    button2Text: z.string().optional(),
    button2Link: z.string().optional(),
  }),
  newsSection: z.object({
    pretitle: z.string().min(1, "Pre-title is required"),
    title: z.string().min(1, "Title is required"),
    count: z.coerce.number().min(1).max(9).optional(),
  }),
  visibility: z.object({
    hero: z.boolean().default(true),
    browseCategory: z.boolean().default(true),
    whyChooseUs: z.boolean().default(true),
    popularDestinations: z.boolean().default(true),
    discountBanners: z.boolean().default(true),
    lastMinuteOffers: z.boolean().default(true),
    testimonials: z.boolean().default(true),
    videoSection: z.boolean().default(true),
    newsSection: z.boolean().default(true),
  }),
});

export function HomePageEditorForm({ initialContent }: { initialContent: HomeContent | null }) {
  // Merge initial content with defaults
  const mergedValues = initialContent ? {
      ...defaultHomePageData,
      ...initialContent,
      hero: { 
          ...defaultHomePageData.hero, 
          ...initialContent.hero, 
          image: undefined 
      },
      whyChooseUs: { 
          ...defaultHomePageData.whyChooseUs, 
          ...initialContent.whyChooseUs, 
          image: undefined 
      },
      browseCategory: {
          ...defaultHomePageData.browseCategory,
          ...initialContent.browseCategory,
          categories: initialContent.browseCategory?.categories || defaultHomePageData.browseCategory.categories,
      },
      popularDestinations: {
          ...defaultHomePageData.popularDestinations,
          ...initialContent.popularDestinations,
      },
      discountBanners: {
          banner1: { 
              ...defaultHomePageData.discountBanners.banner1, 
              ...initialContent.discountBanners?.banner1, 
              image: undefined 
          },
          banner2: { 
              ...defaultHomePageData.discountBanners.banner2, 
              ...initialContent.discountBanners?.banner2, 
              image: undefined 
          },
      },
      lastMinuteOffers: {
          ...defaultHomePageData.lastMinuteOffers,
          ...initialContent.lastMinuteOffers,
      },
      videoSection: { 
          ...defaultHomePageData.videoSection, 
          ...initialContent.videoSection, 
          backgroundImage: undefined 
      },
      newsSection: {
          ...defaultHomePageData.newsSection,
          ...initialContent.newsSection,
      },
      visibility: {
          ...defaultHomePageData.visibility,
          ...initialContent.visibility,
      },
      testimonials: (initialContent.testimonials || defaultHomePageData.testimonials).map(t => ({
          name: t.name,
          role: t.role,
          avatar: t.avatar,
          content: t.content || t.text || "",
      })),
      testimonialCount: initialContent.testimonialCount ?? defaultHomePageData.testimonialCount,
  } : defaultHomePageData;

  const [existingHeroUrls, setExistingHeroUrls] = useState<string[]>(() => {
    const hero = initialContent?.hero;
    const fromArray = Array.isArray(hero?.imageUrls)
      ? hero.imageUrls.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
      : [];
    if (fromArray.length > 0) return fromArray;
    const single = typeof hero?.imageUrl === "string" ? hero.imageUrl.trim() : "";
    return single ? [single] : [];
  });
  const [existingBanner1Url] = useState<string | null>(initialContent?.discountBanners?.banner1?.imageUrl || null);
  const [existingBanner2Url] = useState<string | null>(initialContent?.discountBanners?.banner2?.imageUrl || null);
  const [existingVideoBgUrl] = useState<string | null>(initialContent?.videoSection?.backgroundImageUrl || null);
  const [existingWhyChooseUsUrl] = useState<string | null>(initialContent?.whyChooseUs?.imageUrl || null);
  const [activeTab, setActiveTab] = useState("visibility");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: mergedValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testimonials",
  });

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control: form.control,
    name: "browseCategory.categories",
  });



  async function handleImageUpload(file: File | undefined | null, pathPrefix: string): Promise<string | null> {
      if (!file || typeof File === "undefined" || !(file instanceof File)) return null;
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `home/${pathPrefix}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("cms")
        .upload(path, file, {
          contentType: file.type || "image/png",
          upsert: true,
        });
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("cms")
          .getPublicUrl(path);
        return publicUrlData.publicUrl;
      }
      return null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    // Handle uploads
    const heroFiles = Array.isArray(values.hero?.image) ? values.hero.image : [];
    const whyChooseUsFile = values.whyChooseUs?.image && values.whyChooseUs.image[0];
    const banner1File = values.discountBanners?.banner1?.image && values.discountBanners.banner1.image[0];
    const banner2File = values.discountBanners?.banner2?.image && values.discountBanners.banner2.image[0];
    const videoBgFile = values.videoSection?.backgroundImage && values.videoSection.backgroundImage[0];

    const uploadedHeroUrls = (
      await Promise.all(
        heroFiles.map((file, idx) => handleImageUpload(file as any, `hero-${idx + 1}`)),
      )
    ).filter((value): value is string => typeof value === "string" && value.trim().length > 0);
    const newWhyChooseUsUrl = await handleImageUpload(whyChooseUsFile, "why-choose-us");
    const newBanner1Url = await handleImageUpload(banner1File, "banner1");
    const newBanner2Url = await handleImageUpload(banner2File, "banner2");
    const newVideoBgUrl = await handleImageUpload(videoBgFile, "video-bg");

    const seenHeroUrls = new Set<string>();
    const nextHeroUrls = [...existingHeroUrls, ...uploadedHeroUrls].filter((url) => {
      const normalized = typeof url === "string" ? url.trim() : "";
      if (!normalized) return false;
      if (seenHeroUrls.has(normalized)) return false;
      seenHeroUrls.add(normalized);
      return true;
    });

    const heroUrl = nextHeroUrls[0] || defaultHomePageData.hero.imageUrl;
    const whyChooseUsUrl =
      newWhyChooseUsUrl || existingWhyChooseUsUrl || defaultHomePageData.whyChooseUs.imageUrl;
    const banner1Url =
      newBanner1Url || existingBanner1Url || defaultHomePageData.discountBanners.banner1.imageUrl;
    const banner2Url =
      newBanner2Url || existingBanner2Url || defaultHomePageData.discountBanners.banner2.imageUrl;
    const videoBgUrl =
      newVideoBgUrl ||
      existingVideoBgUrl ||
      defaultHomePageData.videoSection.backgroundImageUrl;

    // Build content payload excluding transient file field
    const {
      hero: _hero,
      whyChooseUs: _whyChooseUs,
      discountBanners: _discountBanners,
      videoSection: _videoSection,
      ...rest
    } = values;
    
    const contentToSave = {
      ...rest,
      hero: {
        title: values.hero.title,
        subtitle: values.hero.subtitle,
        imageUrl: heroUrl,
        imageUrls: nextHeroUrls,
        imageAlt: values.hero.imageAlt,
      },
      whyChooseUs: {
        pretitle: values.whyChooseUs.pretitle,
        title: values.whyChooseUs.title,
        imageUrl: whyChooseUsUrl,
        imageAlt: values.whyChooseUs.imageAlt,
        badgeValue: values.whyChooseUs.badgeValue,
        badgeLabel: values.whyChooseUs.badgeLabel,
        feature1: values.whyChooseUs.feature1,
        feature2: values.whyChooseUs.feature2,
        feature3: values.whyChooseUs.feature3,
      },
      discountBanners: {
          banner1: {
              title: values.discountBanners.banner1.title,
              description: values.discountBanners.banner1.description,
              imageUrl: banner1Url,
              buttonText: values.discountBanners.banner1.buttonText,
              buttonLink: values.discountBanners.banner1.buttonLink,
          },
          banner2: {
              title: values.discountBanners.banner2.title,
              description: values.discountBanners.banner2.description,
              imageUrl: banner2Url,
              buttonText: values.discountBanners.banner2.buttonText,
              buttonLink: values.discountBanners.banner2.buttonLink,
          },
      },
      videoSection: {
          pretitle: values.videoSection.pretitle,
          title: values.videoSection.title,
          backgroundImageUrl: videoBgUrl,
          button1Text: values.videoSection.button1Text,
          button1Link: values.videoSection.button1Link,
          button2Text: values.videoSection.button2Text,
          button2Link: values.videoSection.button2Link,
      },
    };

    try {
      await updateHomePageContent(contentToSave as HomeContent);
      alert("Home page content updated successfully!");
    } catch (error) {
      console.error("Failed to save content:", error);
      alert("Failed to update content.");
    }
  }

  const renderFeatureFields = (featureName: "feature1" | "feature2" | "feature3", label: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormField
          control={form.control}
          name={`whyChooseUs.${featureName}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`whyChooseUs.${featureName}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error("Form validation errors:", errors);
        alert("Please check the form for errors. Some required fields might be missing.");
      })} className="space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full lg:w-auto flex-1 lg:flex-none lg:min-w-[250px]">
            <TabsList className="flex flex-col h-auto w-full items-start justify-start gap-1 bg-muted/20 p-2 rounded-lg">
              <TabsTrigger value="visibility" className="w-full justify-start gap-2">
                <Eye className="h-4 w-4" /> Visibility
              </TabsTrigger>
              <TabsTrigger value="hero" className="w-full justify-start gap-2">
                <Layout className="h-4 w-4" /> Hero Section
              </TabsTrigger>
              <TabsTrigger value="categories" className="w-full justify-start gap-2">
                <Layout className="h-4 w-4" /> Categories
              </TabsTrigger>
              <TabsTrigger value="why-choose-us" className="w-full justify-start gap-2">
                <Layout className="h-4 w-4" /> Why Choose Us
              </TabsTrigger>
              <TabsTrigger value="popular" className="w-full justify-start gap-2">
                <MapPin className="h-4 w-4" /> Popular Destinations
              </TabsTrigger>
              <TabsTrigger value="banners" className="w-full justify-start gap-2">
                <ImageIcon className="h-4 w-4" /> Banners
              </TabsTrigger>
              <TabsTrigger value="offers" className="w-full justify-start gap-2">
                <Tag className="h-4 w-4" /> Last Minute Offers
              </TabsTrigger>
              <TabsTrigger value="video" className="w-full justify-start gap-2">
                <Video className="h-4 w-4" /> Video Section
              </TabsTrigger>
              <TabsTrigger value="news" className="w-full justify-start gap-2">
                <Newspaper className="h-4 w-4" /> News Section
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4" /> Testimonials
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} className="w-full">
              {/* Visibility Tab */}
              <TabsContent value="visibility" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Section Visibility</CardTitle>
                    <CardDescription>Toggle sections on or off to customize your home page layout.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(defaultHomePageData.visibility).map((key) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`visibility.${key}` as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hero Tab */}
              <TabsContent value="hero" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                    <CardDescription>Customize the main banner of your website.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    {existingHeroUrls.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {existingHeroUrls.map((url) => (
                          <div
                            key={url}
                            className="relative aspect-video overflow-hidden rounded-md border bg-muted"
                          >
                            <Image
                              src={url}
                              alt="Hero Preview"
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-2 top-2 h-8 w-8"
                              onClick={() =>
                                setExistingHeroUrls((prev) => prev.filter((item) => item !== url))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : defaultHomePageData.hero.imageUrl ? (
                      <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-muted">
                        <Image
                          src={defaultHomePageData.hero.imageUrl}
                          alt="Hero Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <FormField
                      control={form.control}
                      name="hero.image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Images</FormLabel>
                          <FormControl>
                            <ImageUploader value={field.value || []} onChange={field.onChange} />
                          </FormControl>
                          <FormDescription>Upload multiple images for the auto slider.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hero.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Title</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hero.subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hero.imageAlt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Alt Text (SEO)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Browse Categories</CardTitle>
                    <CardDescription>Manage the category shortcuts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="browseCategory.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="browseCategory.subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section Subtitle</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Categories List</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendCategory({
                              label: "New Category",
                              type: "adventure",
                              icon: "mountain",
                            })
                          }
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        {categoryFields.map((field, index) => (
                          <div key={field.id} className="flex gap-4 items-start border p-4 rounded-lg bg-card">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <FormField
                                control={form.control}
                                name={`browseCategory.categories.${index}.label`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Label</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`browseCategory.categories.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Type Param</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="e.g. adventure" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`browseCategory.categories.${index}.icon`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Icon</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select icon" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {browseCategoryIconKeys.map((icon) => (
                                          <SelectItem key={icon} value={icon} className="capitalize">
                                            {icon}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeCategory(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Why Choose Us Tab */}
              <TabsContent value="why-choose-us" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Why Choose Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="whyChooseUs.pretitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pre-title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="whyChooseUs.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="whyChooseUs.image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section Image</FormLabel>
                              <FormControl>
                                <ImageUploader value={field.value || []} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {(existingWhyChooseUsUrl || defaultHomePageData.whyChooseUs.imageUrl) && (
                          <div className="relative w-full h-40 rounded-md overflow-hidden border bg-muted">
                            <Image
                              src={existingWhyChooseUsUrl || defaultHomePageData.whyChooseUs.imageUrl}
                              alt="Why choose us preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="whyChooseUs.imageAlt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image Alt Text</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="whyChooseUs.badgeValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Badge Value</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="25+" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="whyChooseUs.badgeLabel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Badge Label</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Years Exp." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {renderFeatureFields("feature1", "Feature 1")}
                      {renderFeatureFields("feature2", "Feature 2")}
                      {renderFeatureFields("feature3", "Feature 3")}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Popular Destinations Tab */}
              <TabsContent value="popular" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Destinations</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="popularDestinations.pretitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pre-title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="popularDestinations.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="popularDestinations.count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Tours to Show</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>Min 3, Max 12</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discount Banners Tab */}
              <TabsContent value="banners" className="mt-0">
                <div className="grid gap-6">
                  {["banner1", "banner2"].map((bannerKey, idx) => {
                    // @ts-expect-error - iterating over keys
                    const banner = form.watch(`discountBanners.${bannerKey}`);
                    const existingUrl = bannerKey === "banner1" ? existingBanner1Url : existingBanner2Url;
                    
                    return (
                      <Card key={bannerKey}>
                        <CardHeader>
                          <CardTitle>Banner {idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <FormField
                            control={form.control}
                            name={`discountBanners.${bannerKey}.title` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`discountBanners.${bannerKey}.description` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={2} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`discountBanners.${bannerKey}.buttonText` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Button Text</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`discountBanners.${bannerKey}.buttonLink` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Button Link</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`discountBanners.${bannerKey}.image` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Banner Image</FormLabel>
                                <FormControl>
                                  <ImageUploader value={field.value || []} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {(existingUrl || (banner as any)?.imageUrl) && (
                            <div className="relative w-full h-32 rounded-md overflow-hidden border bg-muted">
                              <Image
                                src={existingUrl || (banner as any)?.imageUrl}
                                alt={`Banner ${idx + 1} preview`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Last Minute Offers Tab */}
              <TabsContent value="offers" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Last Minute Offers</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="lastMinuteOffers.discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Badge (e.g. 20% OFF)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastMinuteOffers.pretitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pre-title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastMinuteOffers.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastMinuteOffers.count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Tours</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Video Section Tab */}
              <TabsContent value="video" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Section</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="videoSection.pretitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pre-title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="videoSection.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="videoSection.backgroundImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Image</FormLabel>
                            <FormControl>
                              <ImageUploader value={field.value || []} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {(existingVideoBgUrl || defaultHomePageData.videoSection.backgroundImageUrl) && (
                        <div className="relative w-full h-40 rounded-md overflow-hidden border bg-muted">
                          <Image
                            src={existingVideoBgUrl || defaultHomePageData.videoSection.backgroundImageUrl}
                            alt="Video background preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4 border p-4 rounded-md">
                        <h4 className="font-medium text-sm">Button 1</h4>
                        <FormField
                          control={form.control}
                          name="videoSection.button1Text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Text</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="videoSection.button1Link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4 border p-4 rounded-md">
                        <h4 className="font-medium text-sm">Button 2</h4>
                        <FormField
                          control={form.control}
                          name="videoSection.button2Text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Text</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="videoSection.button2Link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* News Section Tab */}
              <TabsContent value="news" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>News Section</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="newsSection.pretitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pre-title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newsSection.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newsSection.count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Posts</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Testimonials</CardTitle>
                    <CardDescription>Add customer reviews to build trust.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="testimonialCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Count to Show</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Reviews List</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            append({
                              name: "Happy Customer",
                              role: "Traveler",
                              avatar: "",
                              content: "Great experience!",
                            })
                          }
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Review
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-4 items-start border p-4 rounded-lg bg-card relative">
                            <div className="grid gap-4 flex-1">
                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`testimonials.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`testimonials.${index}.role`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Role</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name={`testimonials.${index}.content`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Content</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={2} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive absolute top-2 right-2"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sticky Footer for Save Action */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 flex justify-end md:pl-64">
          <div className="container max-w-6xl flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Discard Changes
            </Button>
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}


