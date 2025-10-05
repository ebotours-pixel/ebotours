
export type PriceTier = {
  minPeople: number;
  maxPeople: number | null; // null for 'and up'
  pricePerAdult: number;
  pricePerChild: number;
};

export type Tour = {
  id: string;
  slug: string;
  name: string;
  destination: string;
  type: string[];
  duration: number; // in days
  description: string;
  itinerary: { day: number; activity: string }[];
  availability: boolean;
  images: string[];
  rating: number;
  priceTiers: PriceTier[];
  price?: never; // Ensure old price field is not used

  // Detailed tour information
  durationText?: string;
  tourType?: string;
  availabilityDescription?: string;
  pickupAndDropoff?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  cancellationPolicy?: string;
};

export type CartItem = {
  tour: Tour;
  quantity: number; // This might represent adults now, or be refactored
  adults?: number;
  children?: number;
  date?: Date;
};

export type BookingItem = {
  id: string;
  bookingId: string;
  tourId: string;
  adults: number;
  children: number;
  price: number;
  itemDate?: string; // New: specific date for this booking item
  tours?: { // This will be populated by a join query
    name: string;
    slug: string;
  };
};

export type Booking = {
    id: string;
    customerName: string;
    customerEmail: string;
    phoneNumber?: string;
    nationality?: string;
    bookingDate: string; // ISO string format for dates
    totalPrice: number;
    status: "Confirmed" | "Pending" | "Cancelled";
    bookingItems: BookingItem[];
};

export type Customer = {
    id: string;
    name: string;
    email: string;
    source: "Booking" | "Newsletter";
    totalBookings: number;
    totalSpent: number;
    createdAt: string; // ISO string format for dates
    bookings: Booking[];
}

export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  status: "Published" | "Draft";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  featuredImage: string;
  tags: string[];
};
