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
import { X, Plus, Loader2, Save, MapPin, Tag, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { updateAgencySettings, AgencySettingsData } from "@/lib/supabase/agency-content";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Default fallbacks if database is empty
const defaultDestinations = [
  "Cairo", "Luxor", "Aswan", "Sharm El Sheikh", "Hurghada", "Alexandria"
];

const defaultCategories = [
  "Adventure", "Relaxation", "Cultural", "Culinary", "Family", "Honeymoon", "Package", "Daily"
];

function ManageListSection({
  title,
  description,
  icon: Icon,
  items,
  setItems,
  placeholder,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[120px] bg-muted/30 content-start">
          {items.length > 0 ? (
            items.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="text-sm py-1 pl-2.5 pr-1.5 gap-1 hover:bg-secondary/80 transition-colors"
              >
                {item}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="rounded-full p-0.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {item}</span>
                </button>
              </Badge>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm italic">
              No items added yet.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t bg-muted/10 p-4">
        <Input
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddItem();
          }}
          className="bg-background"
        />
        <Button onClick={handleAddItem} size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface SettingsClientProps {
  initialSettings: AgencySettingsData | null;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [destinations, setDestinations] = useState<string[]>(
    initialSettings?.tourDestinations || defaultDestinations
  );
  const [categories, setCategories] = useState<string[]>(
    initialSettings?.tourCategories || defaultCategories
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Merge with existing settings to avoid overwriting other fields
      const updatedSettings: AgencySettingsData = {
        ...initialSettings,
        tourDestinations: destinations,
        tourCategories: categories,
      };

      await updateAgencySettings(updatedSettings);

      toast({
        title: "Settings saved",
        description: "Your tour settings have been successfully updated.",
      });
      
      router.refresh();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b pb-6">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/admin/tours">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to tours</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tours Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure global options for your tours, including available destinations and categories.
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSaveChanges} disabled={isSaving} className="min-w-[140px]">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <ManageListSection
          title="Destinations"
          description="Manage the list of available destinations for your tours."
          icon={MapPin}
          items={destinations}
          setItems={setDestinations}
          placeholder="Add a destination (e.g. Siwa Oasis)"
        />
        <ManageListSection
          title="Categories"
          description="Manage the categories (tags) used to filter tours."
          icon={Tag}
          items={categories}
          setItems={setCategories}
          placeholder="Add a category (e.g. Historical)"
        />
      </div>
    </div>
  );
}