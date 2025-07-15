"use client"

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { getTours } from '@/lib/tours';
import type { Tour } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play } from 'lucide-react';
import { ExclusiveTripIcon, ProfessionalGuideIcon, SafetyFirstIcon } from '@/components/icons';

export default function Home() {
  const tours = getTours();
  
  const popularTours = useMemo(() => {
    return [...tours].sort((a, b) => b.rating - a.rating).slice(0, 5);
  }, [tours]);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center text-white">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image 
          src="https://images.unsplash.com/photo-1646194117458-49fba634fbb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx0cm9waWNhbCUyMHBhcmFkaXNlfGVufDB8fHx8MTc1MjYyMjkwOXww&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="Tropical paradise" 
          fill 
          className="object-cover"
          priority
        />
        <div className="container mx-auto px-4 relative z-20 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold leading-tight mb-4">Let's Make Your Best<br />Trip With Us</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Explore the world with our curated travel packages. Adventure awaits!
          </p>
          <div className="max-w-3xl mx-auto p-4 bg-white/20 backdrop-blur-sm border-0 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input placeholder="Search tour..." className="bg-white text-foreground col-span-1 md:col-span-2" />
                <Select>
                  <SelectTrigger className="bg-white text-foreground"><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                     {Array.from(new Set(tours.map(tour => tour.destination))).map(destination => (
                        <SelectItem key={destination} value={destination.toLowerCase()}>{destination}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                 <Select>
                  <SelectTrigger className="bg-white text-foreground"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="culinary">Culinary</SelectItem>
                    <SelectItem value="relaxation">Relaxation</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="lg" className="w-full">Search</Button>
              </div>
          </div>
        </div>
      </section>

      {/* Browse By Destination Category Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
            <p className="text-primary font-medium">Wonderful Place For You</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Browse By Destination Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {popularTours.map((tour, index) => (
            <div key={tour.id} className={`relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg group ${index === 2 ? 'md:col-span-1' : ''}`}>
              <Image 
                src={tour.image} 
                alt={tour.destination} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint={`${tour.destination} ${tour.type}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Adventure & Travels Section */}
      <section className="py-16 bg-gradient-to-r from-white to-sky-100/30">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="bg-white p-4 rounded-xl shadow-2xl transform -rotate-6">
              <Image src="https://images.unsplash.com/photo-1699115823831-cf1329dfc58f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxhZHZlbnR1cmUlMjB0cmF2ZWx8ZW58MHx8fHwxNzUyNjIyOTA5fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Adventure travel" width={500} height={600} className="rounded-lg" data-ai-hint="adventure travel" />
            </div>
             <div className="absolute bottom-0 left-10 text-center">
              <Button size="lg" variant="secondary" className="rounded-full h-20 w-20 shadow-lg border-4 border-white flex items-center justify-center">
                <Play className="h-8 w-8 text-primary fill-primary" />
              </Button>
              <p className="mt-2 font-semibold">WATCH VIDEO</p>
            </div>
          </div>
          <div className="relative">
            <p className="text-primary font-medium">Let's Go Together</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-6">Great Opportunity For<br/> Adventure & Travels</h2>
            
            <div className="flex gap-6">
               <div className="flex flex-col items-center">
                  <div className="h-14 w-1 bg-cyan-200 rounded-full"></div>
                  <div className="h-4 w-4 bg-cyan-300 rounded-full my-2"></div>
                  <div className="flex-grow w-1 bg-cyan-200 rounded-full"></div>
               </div>
               <ul className="space-y-8 flex-grow">
                <li className="flex items-start gap-4">
                    <div className="bg-white text-primary p-3 rounded-full shadow-md border"><ExclusiveTripIcon className="w-6 h-6" /></div>
                    <div>
                    <h3 className="font-semibold text-lg">Exclusive Trip</h3>
                    <p className="text-muted-foreground text-sm">There are many variations of passages of available, but the majority</p>
                    </div>
                </li>
                <li className="flex items-start gap-4">
                    <div className="bg-white text-primary p-3 rounded-full shadow-md border"><SafetyFirstIcon className="w-6 h-6" /></div>
                    <div>
                    <h3 className="font-semibold text-lg">Safety First Always</h3>
                    <p className="text-muted-foreground text-sm">There are many variations of passages of available, but the majority</p>
                    </div>
                </li>
                <li className="flex items-start gap-4">
                    <div className="bg-white text-primary p-3 rounded-full shadow-md border"><ProfessionalGuideIcon className="w-6 h-6" /></div>
                    <div>
                    <h3 className="font-semibold text-lg">Professional Guide</h3>
                    <p className="text-muted-foreground text-sm">There are many variations of passages of available, but the majority</p>
                    </div>
                </li>
              </ul>
            </div>
             <div className="absolute -bottom-20 -right-20 opacity-20">
              <Image src="https://placehold.co/300x400.png" alt="Traveler" width={300} height={400} data-ai-hint="woman traveler" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
