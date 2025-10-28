import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

const posts = [
  {
    id: 1,
    title: "Getting Started with Sustainable Living",
    description:
      "Learn practical tips to reduce your carbon footprint and live more sustainably.",
    author: "Sarah Johnson",
    date: "Oct 20, 2024",
    category: "Lifestyle",
    image: "/sustainable-living-home.jpg",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "The Future of Renewable Energy",
    description:
      "Exploring the latest innovations in solar and wind technology.",
    author: "Mike Chen",
    date: "Oct 18, 2024",
    category: "Technology",
    image: "/renewable-energy-solar-panels.png",
    readTime: "8 min read",
  },
  {
    id: 3,
    title: "Zero Waste Kitchen Guide",
    description:
      "Transform your kitchen with eco-friendly practices and sustainable choices.",
    author: "Emma Davis",
    date: "Oct 15, 2024",
    category: "Home",
    image: "/eco-friendly-kitchen.jpg",
    readTime: "6 min read",
  },
  {
    id: 1,
    title: "Getting Started with Sustainable Living",
    description:
      "Learn practical tips to reduce your carbon footprint and live more sustainably.",
    author: "Sarah Johnson",
    date: "Oct 20, 2024",
    category: "Lifestyle",
    image: "/sustainable-living-home.jpg",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "The Future of Renewable Energy",
    description:
      "Exploring the latest innovations in solar and wind technology.",
    author: "Mike Chen",
    date: "Oct 18, 2024",
    category: "Technology",
    image: "/renewable-energy-solar-panels.png",
    readTime: "8 min read",
  },
  {
    id: 3,
    title: "Zero Waste Kitchen Guide",
    description:
      "Transform your kitchen with eco-friendly practices and sustainable choices.",
    author: "Emma Davis",
    date: "Oct 15, 2024",
    category: "Home",
    image: "/eco-friendly-kitchen.jpg",
    readTime: "6 min read",
  },
  {
    id: 1,
    title: "Getting Started with Sustainable Living",
    description:
      "Learn practical tips to reduce your carbon footprint and live more sustainably.",
    author: "Sarah Johnson",
    date: "Oct 20, 2024",
    category: "Lifestyle",
    image: "/sustainable-living-home.jpg",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "The Future of Renewable Energy",
    description:
      "Exploring the latest innovations in solar and wind technology.",
    author: "Mike Chen",
    date: "Oct 18, 2024",
    category: "Technology",
    image: "/renewable-energy-solar-panels.png",
    readTime: "8 min read",
  },
  {
    id: 3,
    title: "Zero Waste Kitchen Guide",
    description:
      "Transform your kitchen with eco-friendly practices and sustainable choices.",
    author: "Emma Davis",
    date: "Oct 15, 2024",
    category: "Home",
    image: "/eco-friendly-kitchen.jpg",
    readTime: "6 min read",
  },
];

export default function LatestPosts() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Latest Articles
          </h2>
          <p className="text-muted-foreground">
            Fresh insights and stories published recently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <Link key={post.id + index} href={`/post/${post.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden p-0">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 text-foreground">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
