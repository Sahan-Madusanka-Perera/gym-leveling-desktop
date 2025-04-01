"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Define the session type
type Session = {
  id: string;
  title: string;
  image: string;
  slug: string;
};

const SessionCard = ({ session }: { session: Session }) => {
    return (
      <Link href={`/sessions/${session.slug}`} className="block w-full mb-4">
        <Card className="overflow-hidden h-40 cursor-pointer hover:opacity-95 transition-opacity p-0">
          <div className="relative w-full h-full">
            <Image
              src={session.image}
              alt={session.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex items-center justify-center">
              <h3 className="text-white text-xl font-bold drop-shadow-lg text-center px-2">
                {session.title}
              </h3>
            </div>
          </div>
        </Card>
      </Link>
    );
  };
  
// Make sure to export the component correctly
export function PopularSessions() {
  // Sample data - replace with your actual data
  const sessions: Session[] = [
    {
      id: "1",
      title: "Stretch & Recovery",
      image: "/images/stretch-recovery.jpg",
      slug: "stretch-recovery",
    },
    {
      id: "2",
      title: "Strength Training",
      image: "/images/strength-training.jpg",
      slug: "strength-training",
    },
    {
      id: "3",
      title: "Kickboxing",
      image: "/images/kickboxing.jpg",
      slug: "kickboxing",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Popular Sessions</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col">
        {sessions.slice(0, 3).map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
        <div className="mt-4 flex justify-center">
          <Link href="/sessions">
            <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-full transition-colors">
              see all sessions
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}