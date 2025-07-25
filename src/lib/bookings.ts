
import type { Booking } from '@/types';
import { getTours } from './tours';

const tours = getTours();

const generateBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const statuses: Booking['status'][] = ["Confirmed", "Pending", "Cancelled"];

  for (let i = 0; i < 25; i++) {
    const tour = tours[i % tours.length];
    const adults = Math.floor(Math.random() * 4) + 1;
    const children = Math.floor(Math.random() * 3);
    const totalPeople = adults + children;

    const priceTier = tour.priceTiers.find(tier => 
      totalPeople >= tier.minPeople && (tier.maxPeople === null || totalPeople <= tier.maxPeople)
    ) || tour.priceTiers[tour.priceTiers.length - 1];

    const totalPrice = (adults * priceTier.pricePerAdult) + (children * priceTier.pricePerChild);
    
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 60));

    const customerFirstName = ["John", "Jane", "Alex", "Emily", "Chris", "Katie", "Michael", "Sarah"][Math.floor(Math.random() * 8)];
    const customerLastName = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"][Math.floor(Math.random() * 8)];


    bookings.push({
      id: `booking-${i + 1}`,
      customerName: `${customerFirstName} ${customerLastName}`,
      customerEmail: `${customerFirstName.toLowerCase()}.${customerLastName.toLowerCase()}@example.com`,
      tourId: tour.id,
      tourName: tour.name,
      tourSlug: tour.slug,
      bookingDate: bookingDate.toISOString(),
      adults,
      children,
      totalPrice: totalPrice,
      status: statuses[i % statuses.length],
    });
  }
  return bookings;
};

const bookings = generateBookings();

export const getBookings = (): Booking[] => bookings;

export const getBookingById = (id: string): Booking | undefined => bookings.find(b => b.id === id);
