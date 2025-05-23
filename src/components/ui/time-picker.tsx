"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  label,
  className,
}: TimePickerProps) {
  // Parse the initial values from the input value
  const parseTimeValue = (timeValue: string) => {
    if (!timeValue) return { hour: "09", minute: "00", period: "AM" as const };
    
    const [hourStr, minuteStr] = timeValue.split(":");
    const hourVal = parseInt(hourStr || "0");
    
    if (isNaN(hourVal)) return { hour: "09", minute: "00", period: "AM" as const };
    
    // Convert from 24-hour to 12-hour format
    let displayHour = hourVal % 12;
    if (displayHour === 0) displayHour = 12;
    
    return { 
      hour: displayHour.toString(), 
      minute: minuteStr || "00", 
      period: hourVal >= 12 ? "PM" as const : "AM" as const 
    };
  };

  // Use local state only for the popover interactions
  const [localHour, setLocalHour] = React.useState(() => parseTimeValue(value).hour);
  const [localMinute, setLocalMinute] = React.useState(() => parseTimeValue(value).minute);
  const [localPeriod, setLocalPeriod] = React.useState(() => parseTimeValue(value).period);
  const [isOpen, setIsOpen] = React.useState(false);

  // Update local state when value changes from outside and the popover is closed
  React.useEffect(() => {
    // Only update local state when popover is closed to avoid conflicts
    if (!isOpen) {
      const { hour, minute, period } = parseTimeValue(value);
      setLocalHour(hour);
      setLocalMinute(minute);
      setLocalPeriod(period);
    }
  }, [value, isOpen]);

  // Apply time changes only when popover is closed or explicitly requested
  const applyTimeChange = () => {
    let hourVal = parseInt(localHour);
    
    // Convert to 24-hour format for storage
    if (localPeriod === "PM" && hourVal < 12) {
      hourVal += 12;
    } else if (localPeriod === "AM" && hourVal === 12) {
      hourVal = 0;
    }
    
    // Format to ensure two digits
    const hourStr = hourVal.toString().padStart(2, "0");
    const minuteStr = localMinute.padStart(2, "0");
    
    const newValue = `${hourStr}:${minuteStr}`;
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  // Handle popover state
  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen) {
      // Apply changes when closing the popover
      applyTimeChange();
    }
    setIsOpen(open);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    let hourVal = parseInt(val);
    
    // Handle validation for 12-hour format
    if (isNaN(hourVal) || hourVal < 1) {
      hourVal = 1;
    } else if (hourVal > 12) {
      hourVal = 12;
    }
    
    setLocalHour(hourVal.toString());
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    let minuteVal = parseInt(val);
    
    // Handle validation for minutes
    if (isNaN(minuteVal) || minuteVal < 0) {
      minuteVal = 0;
    } else if (minuteVal > 59) {
      minuteVal = 59;
    }
    
    setLocalMinute(minuteVal.toString().padStart(2, "0"));
  };

  const togglePeriod = () => {
    setLocalPeriod(prev => prev === "AM" ? "PM" : "AM");
  };

  // Handle preset selection
  const handlePresetClick = (preset: { hour: string; minute: string; period: "AM" | "PM" }) => {
    setLocalHour(preset.hour);
    setLocalMinute(preset.minute);
    setLocalPeriod(preset.period);
    
    // Immediately apply the change (don't wait for popover close)
    setTimeout(() => applyTimeChange(), 0);
  };

  // Common time presets for quick selection
  const presets: Array<{ hour: string; minute: string; period: "AM" | "PM" }> = [
    { hour: "09", minute: "00", period: "AM" },
    { hour: "12", minute: "00", period: "PM" },
    { hour: "01", minute: "00", period: "PM" },
    { hour: "05", minute: "00", period: "PM" },
    { hour: "07", minute: "00", period: "PM" },
  ];

  // Format display value for the input trigger
  const formatDisplayValue = () => {
    if (!value) return "Select time";
    
    const [hourStr, minuteStr] = value.split(":");
    const hourVal = parseInt(hourStr);
    
    if (isNaN(hourVal)) return "Select time";
    
    // Convert from 24-hour to 12-hour format
    let displayHour = hourVal % 12;
    if (displayHour === 0) displayHour = 12;
    
    const period = hourVal >= 12 ? "PM" : "AM";
    
    return `${displayHour}:${minuteStr || "00"} ${period}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {formatDisplayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              <div className="flex flex-col">
                <Label htmlFor="hour" className="text-xs text-center mb-1">
                  Hour
                </Label>
                <Input
                  id="hour"
                  value={localHour}
                  onChange={handleHourChange}
                  className="w-14 text-center"
                />
              </div>
              <div className="flex items-center pt-7">:</div>
              <div className="flex flex-col">
                <Label htmlFor="minute" className="text-xs text-center mb-1">
                  Min
                </Label>
                <Input
                  id="minute"
                  value={localMinute}
                  onChange={handleMinuteChange}
                  className="w-14 text-center"
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3"
                  onClick={togglePeriod}
                >
                  {localPeriod}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Quick select</Label>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={`${preset.hour}:${preset.minute}${preset.period}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {`${preset.hour}:${preset.minute} ${preset.period}`}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={() => {
                applyTimeChange();
                setIsOpen(false);
              }}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 