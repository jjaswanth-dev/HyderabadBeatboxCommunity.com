import Header from "@/components/Header";
import ImageCarousel from "@/components/ImageCarousel";
import About from "@/components/About";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import Videos from "@/components/Videos";
import OurClients from "@/components/OurClients";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <div className="bg-black text-white">
      <Header />
      <ImageCarousel />
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
