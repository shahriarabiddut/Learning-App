import FeaturedSection from "../home/featured-section";
import Header from "../home/header";
import Hero from "../home/hero";
import LatestPosts from "../home/latest-posts";
import NewsletterSection from "../home/newsletter-section";
import TopAuthors from "../home/top-authors";
import Categories from "../home/categories";
import TrendingSection from "../home/trending-section";

const HomePage = () => {
  return (
    <main className="min-h-screen bg-background dark:bg-background">
      <Header />
      <Hero />
      <TopAuthors />
      <Categories />
      <FeaturedSection />
      <LatestPosts />
      <TrendingSection />
      <NewsletterSection />
    </main>
  );
};

export default HomePage;
