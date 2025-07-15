"use client"

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { TourCard } from '@/components/tour-card';
import { getTours } from '@/lib/tours';
import type { Tour } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const tours = getTours();
  
  const popularTours = useMemo(() => {
    return [...tours].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, [tours]);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center text-white">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image 
          src="https://placehold.co/1920x1080.png" 
          alt="Tropical paradise" 
          fill 
          className="object-cover"
          data-ai-hint="tropical paradise"
          priority
        />
        <div className="container mx-auto px-4 relative z-20 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold leading-tight mb-4">Let's Make Your Best<br />Trip With Us</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Explore the world with our curated travel packages. Adventure awaits!
          </p>
          <Card className="max-w-4xl mx-auto p-4 bg-white/20 backdrop-blur-sm border-0">
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input placeholder="Search tour..." className="bg-white text-foreground col-span-1 md:col-span-2" />
                <Select>
                  <SelectTrigger className="bg-white text-foreground"><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greece">Greece</SelectItem>
                    <SelectItem value="italy">Italy</SelectItem>
                    <SelectItem value="japan">Japan</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="lg" className="w-full">Search</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Popular Destinations</h2>
          <p className="text-muted-foreground mt-2">We Offer For All</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularTours.map((tour: Tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg">View All Tours</Button>
        </div>
      </section>

      {/* Adventure & Travels Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image src="https://placehold.co/600x700.png" alt="Adventure travel" width={600} height={700} className="rounded-lg shadow-xl" data-ai-hint="adventure travel" />
          </div>
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">Great Opportunity For Adventure & Travels</h2>
            <p className="text-muted-foreground mb-6">
              Discover amazing places at exclusive deals. We have a wide range of tours to suit every traveler.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full"><MapPinIcon className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-semibold text-lg">2000+ Our Worldwide Guides</h3>
                  <p className="text-muted-foreground text-sm">Expert guides to make your trip memorable.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full"><UsersIcon className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-semibold text-lg">100% Trusted Tour Agency</h3>
                  <p className="text-muted-foreground text-sm">We are a trusted name in the travel industry.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full"><CalendarIcon className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-semibold text-lg">10+ Years of Travel Experience</h3>
                  <p className="text-muted-foreground text-sm">Experience that you can count on.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Discount Banners */}
      <section className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
        <div className="relative p-8 rounded-lg overflow-hidden text-white bg-blue-500">
          <h3 className="font-headline text-3xl font-bold">35% OFF</h3>
          <p className="mb-4">on all European tours this summer!</p>
          <Button variant="secondary">Book Now</Button>
        </div>
        <div className="relative p-8 rounded-lg overflow-hidden text-white bg-cyan-600">
          <h3 className="font-headline text-3xl font-bold">35% OFF</h3>
          <p className="mb-4">for all new adventure package bookings.</p>
          <Button variant="secondary">Discover More</Button>
        </div>
      </section>

    </div>
  );
}
