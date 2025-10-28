"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const trendingPosts = [
  {
    id: 1,
    title: "5 Ways to Reduce Plastic Waste",
    views: "12.5K",
    image: "/eco-friendly-kitchen.jpg",
    category: "Lifestyle",
  },
  {
    id: 2,
    title: "Solar Energy: The Future is Now",
    views: "9.8K",
    image: "/renewable-energy-solar-panels.png",
    category: "Technology",
  },
  {
    id: 3,
    title: "Minimalist Home Design Trends",
    views: "8.3K",
    image: "/home-interior-design.jpg",
    category: "Home",
  },
  {
    id: 4,
    title: "Sustainable Fashion Guide",
    views: "7.6K",
    image: "/lifestyle-wellness.jpg",
    category: "Lifestyle",
  },
];

export default function TrendingSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trending Now
            </h2>
          </div>
          <p className="text-muted-foreground">
            Most viewed articles this week
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/post/${post.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer p-0">
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                      #{index + 1}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <h3 className="text-sm font-bold text-foreground mt-3 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {post.views} views
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
