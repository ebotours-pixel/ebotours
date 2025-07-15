import Link from 'next/link';
import Image from 'next/image';
import type { Tour } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Star } from 'lucide-react';

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="relative h-56 w-full overflow-hidden">
        <Link href={`/tours/${tour.id}`}>
            <Image
              src={tour.image}
              alt={tour.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={`${tour.destination} ${tour.type}`}
            />
        </Link>
        <div className="absolute top-4 left-4">
            <Badge variant="default" className="bg-primary text-primary-foreground text-sm">${tour.price.toLocaleString()}</Badge>
        </div>
         {!tour.availability && (
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg">Sold Out</Badge>
               </div>
            )}
      </div>

      <CardContent className="flex-grow p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{tour.destination}</span>
        </div>
        <h3 className="font-headline text-xl font-semibold h-14">
            <Link href={`/tours/${tour.id}`} className="hover:text-primary transition-colors">
                {tour.name}
            </Link>
        </h3>
        <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{tour.duration} Days</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{tour.rating.toFixed(1)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
