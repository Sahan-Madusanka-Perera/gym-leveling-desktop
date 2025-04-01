import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DailyRundownCard() {
  // Get current date information
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentDate);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
  const year = currentDate.getFullYear();

  return (
    <Card className="p-4">
      <CardContent className="p-2 space-y-3">
        {/* Card Title */}
        <h2 className="text-xl font-bold">Daily Rundown</h2>
        
        {/* Date Display */}
        <div className="flex justify-between items-center">
          <div className="bg-gray-200 rounded-xl p-2 w-16 h-16 flex items-center justify-center">
            <span className="text-4xl font-bold">{day}</span>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-semibold">{dayName}</h3>
            <p className="text-lg">{month}</p>
            <p className="text-sm">{year}</p>
          </div>
        </div>
        
        {/* Sessions Info */}
        <div className="space-y-1">
          <h4 className="text-base font-bold">4 Upcoming Sessions</h4>
          
          <div className="flex justify-between items-center gap-x-4">
            <Badge className="bg-black text-white px-2 py-1 rounded-full text-xs">
                Nutrition Consultation
            </Badge>
            <span className="text-xs font-light">Next at 11:00 AM</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
