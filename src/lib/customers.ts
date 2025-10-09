import type { Customer, Booking } from "@/types";
import { getBookings } from "./bookings";

const allBookings = getBookings();

// In a real app, you would fetch this from your database.
// For this mock data, we will derive customers from the bookings list.
const generateCustomers = (): Customer[] => {
  const customersByEmail: Record<string, Customer> = {};

  // Process customers from bookings
  allBookings.forEach((booking) => {
    if (!customersByEmail[booking.customerEmail]) {
      customersByEmail[booking.customerEmail] = {
        id: `cust-${Object.keys(customersByEmail).length + 1}`,
        email: booking.customerEmail,
        name: booking.customerName,
        source: "Booking",
        totalBookings: 0,
        totalSpent: 0,
        createdAt: new Date(
          new Date(booking.bookingDate).getTime() - 86400000,
        ).toISOString(), // Assume they signed up a day before first booking
        bookings: [],
      };
    }

    const customer = customersByEmail[booking.customerEmail];
    customer.totalBookings += 1;
    customer.totalSpent += booking.totalPrice;
    customer.bookings.push(booking);
  });

  // Add some newsletter-only subscribers for variety
  const newsletterSubscribers = [
    {
      id: `cust-${Object.keys(customersByEmail).length + 1}`,
      email: "charlie.brown@email.com",
    },
    {
      id: `cust-${Object.keys(customersByEmail).length + 2}`,
      email: "diana.prince@email.com",
    },
    {
      id: `cust-${Object.keys(customersByEmail).length + 3}`,
      email: "ethan.hunt@email.com",
    },
  ];

  newsletterSubscribers.forEach((sub) => {
    if (!customersByEmail[sub.email]) {
      const signupDate = new Date();
      signupDate.setDate(signupDate.getDate() - Math.floor(Math.random() * 90));
      customersByEmail[sub.email] = {
        ...sub,
        name: sub.email, // For newsletter subs, name is the email
        source: "Newsletter",
        totalBookings: 0,
        totalSpent: 0,
        createdAt: signupDate.toISOString(),
        bookings: [],
      };
    }
  });

  return Object.values(customersByEmail).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

const customers = generateCustomers();

export const getCustomers = (): Customer[] => customers;

export const getCustomerById = (id: string): Customer | undefined =>
  customers.find((c) => c.id === id);
