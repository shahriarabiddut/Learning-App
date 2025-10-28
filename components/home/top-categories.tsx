"use client";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Lifestyle",
    count: 24,
    image: "/lifestyle-wellness.jpg",
    color: "from-green-400 to-green-600",
  },
  {
    id: 2,
    name: "Technology",
    count: 18,
    image: "/technology-innovation.jpg",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 3,
    name: "Home",
    count: 15,
    image: "/home-interior-design.jpg",
    color: "from-amber-400 to-amber-600",
  },
  {
    id: 4,
    name: "Travel",
    count: 12,
    image: "/travel-adventure.png",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: 5,
    name: "Fashion",
    count: 21,
    image: "/fashion-style.jpg",
    color: "from-pink-400 to-pink-600",
  },
  {
    id: 6,
    name: "Food",
    count: 19,
    image: "/food-culinary.jpg",
    color: "from-red-400 to-red-600",
  },
];

export default function TopCategories() {
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(true);
  const shouldAutoScroll = categories.length > 4;
  const autoScrollRef = useRef(null);

  // Check scroll position for navigation buttons
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftNav(scrollLeft > 20);
      setShowRightNav(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!shouldAutoScroll || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollSpeed = 0.5;

    const scroll = () => {
      if (!isPaused && !isDragging && container) {
        container.scrollLeft += scrollSpeed;

        // Reset to beginning when reaching the end for infinite scroll
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 1) {
          container.scrollLeft = 0;
        }
      }
      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [isPaused, isDragging, shouldAutoScroll]);

  // Mouse drag functionality
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.scrollBehavior = "auto";
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.scrollBehavior = "smooth";
    setTimeout(() => setIsPaused(false), 1000);
  };

  const handleMouseLeave = () => {
    if (isDragging && scrollContainerRef.current) {
      setIsDragging(false);
      scrollContainerRef.current.style.scrollBehavior = "smooth";
      setTimeout(() => setIsPaused(false), 1000);
    }
  };

  // Touch support
  const handleTouchStart = (e) => {
    if (!scrollContainerRef.current) return;
    setIsPaused(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Navigation buttons
  const scrollByOne = (direction) => {
    if (!scrollContainerRef.current) return;
    setIsPaused(true);
    const cardWidth = 316; // 300px + 16px gap
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    setTimeout(() => setIsPaused(false), 1000);
  };

  const CategoryCard = ({ category }) => (
    <div className="flex-shrink-0 w-[280px] md:w-[300px]">
      <Link href={`/category/${category.id}`}>
        <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border-0 shadow-md p-0">
          <CardContent className="p-0 relative h-64 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out pointer-events-none select-none"
              draggable="false"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 select-none">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <span className="text-white text-2xl font-bold">
                  {category.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-white font-bold text-2xl text-center mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                {category.name}
              </h3>
              <p className="text-white/90 text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                {category.count} articles
              </p>
            </div>

            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-300" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );

  return (
    <section
      id="categories"
      className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
    >
      <div className="w-11/12 mx-auto ">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 bg-clip-text  bg-gradient-to-r from-foreground to-foreground/70">
            Top Categories
          </h2>
          <p className="text-muted-foreground text-lg">Explore articles</p>
        </div>

        {shouldAutoScroll ? (
          <div
            className="relative group/carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => !isDragging && setIsPaused(false)}
          >
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollByOne("left")}
              className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700 ${
                showLeftNav ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={() => scrollByOne("right")}
              className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700 ${
                showRightNav ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollContainerRef}
              className={`flex gap-6 overflow-x-auto scroll-smooth select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Triple categories for seamless infinite scroll */}
              {[...categories, ...categories, ...categories].map(
                (category, index) => (
                  <CategoryCard
                    key={`${category.id}-${index}`}
                    category={category}
                  />
                )
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
