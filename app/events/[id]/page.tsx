import connectToDatabase from "@/lib/mongodb";
import Event from "@/models/Event";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import EventDetailPageClient from "./EventDetailPageClient";

interface Params {
  id: string;
}

// Generate dynamic metadata for SEO & social platform preview cards (WhatsApp, Instagram, Twitter/X, Discord, Slack)
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  await connectToDatabase();
  try {
    const event = await Event.findById(resolvedParams.id);
    if (!event) {
      return {
        title: "Event - Hyderabad Beatbox Community",
      };
    }

    const title = `${event.title} | Hyderabad Beatbox Community`;
    const description = event.description
      ? event.description.substring(0, 160) + "..."
      : `Join us for ${event.title} on ${event.date} in Hyderabad!`;
    
    const imageUrl = event.image?.startsWith("data:image") ? "" : event.image;

    return {
      title,
      description,
      openGraph: {
        title: event.title,
        description,
        type: "article",
        images: imageUrl ? [{ url: imageUrl, alt: event.title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating event metadata:", error);
    return {
      title: "Event - Hyderabad Beatbox Community",
    };
  }
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  
  let event = null;
  try {
    const foundEvent = await Event.findById(resolvedParams.id);
    if (foundEvent) {
      event = JSON.parse(JSON.stringify(foundEvent));
    }
  } catch (error) {
    console.error("Error fetching event:", error);
  }

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0066FF] selection:text-white">
      <EventDetailPageClient event={event} />
    </div>
  );
}
