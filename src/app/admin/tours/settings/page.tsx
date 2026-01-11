"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, PlusCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// In a real app, these would come from a database or a config file.
const initialDestinations = [
  "Cairo",
  "Luxor",
  "Aswan",
  "Sharm El Sheikh",
  "Hurghada",
  "Alexandria",
];
const initialCategories = [
  "Adventure",
  "Relaxation",
  "Cultural",
  "Culinary",
  "Family",
  "Honeymoon",
  "Package",
  "Daily",
];

function ManageListSection({
  title,
  description,
  items,
  setItems,
  placeholder,
}: {
  title: string;
  description: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (
      newItem.trim() &&
      !items.find((item) => item.toLowerCase() === newItem.trim().toLowerCase())
    ) {
      setItems((prev) => [...prev, newItem.trim()].sort());
      setNewItem("");
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setItems((prev) => prev.filter((item) => item !== itemToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 p-4 border rounded-md min-h-24 bg-muted/50">
          {items.length > 0 ? (
            items.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="text-base py-1 pl-3 pr-2"
              >
                {item}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="ml-2 rounded-full p-0.5 hover:bg-destructive/20 text-destructive outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {item}</span>
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground self-center mx-auto">
              No items yet.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddItem();
          }}
        />
        <Button onClick={handleAddItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TourSettingsPage() {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [categories, setCategories] = useState(initialCategories);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      console.log("Saving changes:", { destinations, categories });
      alert(
        "Changes saved to console! In a real app, this would update the database.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/tours">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to tours</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tours Settings</h2>
          <p className="text-muted-foreground">
            Manage options for destinations and categories available when
            creating a new tour.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <ManageListSection
          title="Manage Destinations"
          description="Add or remove tour destinations."
          items={destinations}
          setItems={setDestinations}
          placeholder="e.g. Siwa Oasis"
        />
        <ManageListSection
          title="Manage Tour Categories"
          description="Add or remove categories (tags) for tours."
          items={categories}
          setItems={setCategories}
          placeholder="e.g. Historical"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} size="lg" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
