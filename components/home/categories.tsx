"use client";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useFetchPostCategoriesQuery } from "@/lib/redux-features/blogPost/blogPostApi";

export default function Categories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(true);
  const autoScrollRef = useRef<number | null>(null);

  // Fetch categories from API
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useFetchPostCategoriesQuery({
    page: 1,
    limit: 25,
    sortBy: "name-asc",
  });

  const categories = categoriesData?.data || [];
  const shouldAutoScroll = categories.length > 4;

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
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.scrollBehavior = "auto";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsPaused(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Navigation buttons
  const scrollByOne = (direction: "left" | "right") => {
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

  // Get gradient color based on category name or index
  const getCategoryColor = (index: number) => {
    const colors = [
      "from-green-400 to-green-600",
      "from-blue-400 to-blue-600",
      "from-amber-400 to-amber-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-red-400 to-red-600",
      "from-cyan-400 to-cyan-600",
      "from-indigo-400 to-indigo-600",
      "from-orange-400 to-orange-600",
      "from-teal-400 to-teal-600",
    ];
    return colors[index % colors.length];
  };

  const CategoryCard = ({
    category,
    index,
  }: {
    category: any;
    index: number;
  }) => (
    <div className="flex-shrink-0 w-[280px] md:w-[300px]">
      <Link href={`/category/${category?.slug || category?.id}`}>
        <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border-0 shadow-md p-0">
          <CardContent className="p-0 relative h-64 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
            {category?.image && (
              <Image
                src={category?.image}
                alt={category?.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out pointer-events-none select-none"
                draggable="false"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 select-none">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getCategoryColor(
                  index
                )} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <span className="text-white text-2xl font-bold">
                  {category?.name?.charAt(0)}
                </span>
              </div>
              <h3 className="text-white font-bold text-2xl text-center mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                {category?.name}
              </h3>
              <p className="text-white/90 text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                {category?.postCount || 0} articles
              </p>
            </div>

            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-300" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <section
        id="categories"
        className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
      >
        <div className="w-11/12 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Top Categories
            </h2>
            <p className="text-muted-foreground text-lg">Explore articles</p>
          </div>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (isError || categories.length === 0) {
    return (
      <section
        id="categories"
        className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
      >
        <div className="w-11/12 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Top Categories
            </h2>
            <p className="text-muted-foreground text-lg">
              {isError
                ? "Unable to load categories"
                : "No categories available yet"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="categories"
      className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
    >
      <div className="w-11/12 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
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
                    key={`${category?.id}-${index}`}
                    category={category}
                    index={index}
                  />
                )
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={category?.id}
                category={category}
                index={index}
              />
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
