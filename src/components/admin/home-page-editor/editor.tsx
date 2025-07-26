
"use client"

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Trash2 } from "lucide-react";

// In a real app, this default data would come from a database or API
const defaultHomePageData = {
    hero: {
        title: "Let's Make Your Best<br />Trip With Us",
        subtitle: "Explore the world with our curated travel packages. Adventure awaits!",
    },
    discountBanners: {
        banner1: {
            title: "35% OFF",
            description: "Explore The World tour Hotel Booking."
        },
        banner2: {
            title: "35% OFF",
            description: "On Flight Ticket Grab This Now."
        }
    },
    testimonials: [
        {
          name: 'Brooklyn Simmons',
          role: 'Brooklyn Simmons',
          avatar: 'https://placehold.co/100x100.png',
          text: 'Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.',
        },
        {
          name: 'Kristin Watson',
          role: 'Web Designer',
          avatar: 'https://placehold.co/100x100.png',
          text: 'Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.',
        },
        {
          name: 'Wade Warren',
          role: 'President Of Sales',
          avatar: 'https://placehold.co/100x100.png',
          text: 'Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.',
        }
    ]
};

const testimonialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.string().min(1, "Role is required"),
    avatar: z.string().url("Must be a valid URL"),
    text: z.string().min(10, "Testimonial text is too short"),
});

const formSchema = z.object({
  hero: z.object({
    title: z.string().min(1, "Hero title is required"),
    subtitle: z.string().min(1, "Hero subtitle is required"),
  }),
  discountBanners: z.object({
      banner1: z.object({
          title: z.string().min(1, "Title is required"),
          description: z.string().min(1, "Description is required"),
      }),
      banner2: z.object({
          title: z.string().min(1, "Title is required"),
          description: z.string().min(1, "Description is required"),
      }),
  }),
  testimonials: z.array(testimonialSchema),
});


export function HomePageEditorForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultHomePageData,
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testimonials",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Home Page Data Saved:", values);
    alert("Home page content saved! Check the console for the data.");
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">Hero Section</AccordionTrigger>
                    <AccordionContent>
                        <Card className="border-0 shadow-none">
                            <CardContent className="pt-6 grid gap-6">
                                <FormField control={form.control} name="hero.title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Main Title</FormLabel>
                                        <FormControl><Textarea {...field} rows={2} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="hero.subtitle" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl><Textarea {...field} rows={2} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold">Discount Banners</AccordionTrigger>
                    <AccordionContent>
                         <Card className="border-0 shadow-none">
                            <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                               <Card>
                                    <CardHeader><CardTitle>Banner 1 (Cyan)</CardTitle></CardHeader>
                                    <CardContent className="grid gap-4">
                                        <FormField control={form.control} name="discountBanners.banner1.title" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="discountBanners.banner1.description" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </CardContent>
                               </Card>
                               <Card>
                                    <CardHeader><CardTitle>Banner 2 (Blue)</CardTitle></CardHeader>
                                    <CardContent className="grid gap-4">
                                        <FormField control={form.control} name="discountBanners.banner2.title" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="discountBanners.banner2.description" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </CardContent>
                               </Card>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold">Testimonials</AccordionTrigger>
                    <AccordionContent>
                        <Card className="border-0 shadow-none">
                            <CardContent className="pt-6 space-y-4">
                                {fields.map((field, index) => (
                                    <Card key={field.id} className="relative p-4">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name={`testimonials.${index}.name`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <FormField control={form.control} name={`testimonials.${index}.role`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Role</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </div>
                                        <FormField control={form.control} name={`testimonials.${index}.avatar`} render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Avatar URL</FormLabel>
                                                <FormControl><Input {...field} placeholder="https://placehold.co/100x100.png" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`testimonials.${index}.text`} render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Testimonial Text</FormLabel>
                                                <FormControl><Textarea {...field} rows={3} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </Card>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ name: "", role: "", avatar: "", text: "" })}
                                >
                                   <PlusCircle className="mr-2 h-4 w-4"/> Add Testimonial
                                </Button>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <div className="flex justify-end sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm">
                <Button type="submit" size="lg">Save Changes</Button>
            </div>
        </form>
    </Form>
  )
}
