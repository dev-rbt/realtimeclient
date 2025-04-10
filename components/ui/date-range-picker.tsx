"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange?: (date: DateRange | undefined) => void;
  className?: string;
  align?: "center" | "start" | "end";
  locale?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "start",
  locale = "en",
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  // Predefined date ranges
  const predefinedRanges = [
    {
      label: "Bugün",
      range: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      label: "Dün",
      range: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      label: "Son 7 Gün",
      range: {
        from: addDays(new Date(), -6),
        to: new Date(),
      },
    },
    {
      label: "Son 30 Gün",
      range: {
        from: addDays(new Date(), -29),
        to: new Date(),
      },
    },
    {
      label: "Bu Ay",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ];

  // Apply predefined range
  const applyPredefinedRange = (range: DateRange) => {
    setDate(range);
    onChange?.(range);
  };

  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d MMMM", { locale: tr })} -{" "}
                  {format(date.to, "d MMMM yyyy", { locale: tr })}
                </>
              ) : (
                format(date.from, "d MMMM yyyy", { locale: tr })
              )
            ) : (
              <span>Tarih Seçin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col sm:flex-row">
            <div className="border-r p-2 space-y-2">
              {predefinedRanges.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => applyPredefinedRange(item.range)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={tr}
            />
          </div>
          <div className="flex items-center justify-end gap-2 p-3 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setDate(undefined);
                onChange?.(undefined);
              }}
            >
              Temizle
            </Button>
            <Button onClick={() => onChange?.(date)}>Uygula</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
