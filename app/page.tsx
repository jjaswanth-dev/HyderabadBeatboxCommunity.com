import Header from "@/components/Header";
import ImageCarousel from "@/components/ImageCarousel";
import About from "@/components/About";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import Videos from "@/components/Videos";
import OurClients from "@/components/OurClients";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import connectToDatabase from "@/lib/mongodb";
import HomeImage from "@/models/HomeImage";

export const revalidate = 60; // Revalidate every 60 seconds

async function getHomeImages(): Promise<string[]> {
  try {
    await connectToDatabase();
    const items = await HomeImage.find({}).lean();
    if (items && items.length > 0) {
      return items.map((doc: any) => doc.image);
    }
  } catch (err) {
    console.error("Error pre-fetching home images:", err);
  }
  return ["/home1.webp"]; // Fallback to single static image if DB is unreachable
}

export default async function Home() {
  const initialImages = await getHomeImages();

  return (
    <div className="bg-black text-white">
      <Header />
      <ImageCarousel initialImages={initialImages} />
      <About />
      <Events />
      <Gallery />
      <Videos />
      <OurClients />
      <Blog initialLimit={6} />
      <Contact />
    </div>
  );
}
