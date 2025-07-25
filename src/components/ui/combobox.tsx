
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "./badge"

export type ComboboxOption = {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  selected: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function Combobox({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (currentValue: string) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter((item) => item !== currentValue)
      : [...selected, currentValue]
    onChange(newSelected)
  }

  const handleRemove = (valueToRemove: string) => {
    onChange(selected.filter(item => item !== valueToRemove));
  }
  
  const selectedLabels = selected
    .map(value => options.find(option => option.value === value)?.label)
    .filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("flex flex-col gap-2", className)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto"
          >
            <div className="flex gap-1 flex-wrap">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label, index) => (
                    <Badge variant="secondary" key={index} className="mr-1">
                        {label}
                    </Badge>
                ))
              ) : (
                placeholder
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <div className="w-full">
            {selected.length > 0 && (
                <div className="flex gap-2 flex-wrap p-2 bg-muted/50 rounded-md border">
                    {selected.map((value) => {
                         const option = options.find(opt => opt.value === value);
                         return(
                            <Badge
                                key={value}
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                {option?.label}
                                <button
                                    className="appearance-none"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemove(value)
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                         )
                    })}
                </div>
            )}
        </div>
      </div>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
