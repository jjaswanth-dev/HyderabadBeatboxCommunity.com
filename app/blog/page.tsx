import Blog from "@/components/Blog";

export const metadata = {
  title: "Blog - Hyderabad Beatbox Community",
  description: "Read the latest blog posts from the Hyderabad Beatbox Community.",
};

export default function BlogPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Blog />
    </div>
  );
}
