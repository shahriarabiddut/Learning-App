import FeaturedSection from "../home/featured-section";
import Header from "../home/header";
import Hero from "../home/hero";
import LatestPosts from "../home/latest-posts";
import NewsletterSection from "../home/newsletter-section";
import TopAuthors from "../home/top-authors";
import TopCategories from "../home/top-categories";
import TrendingSection from "../home/trending-section";

const HomePage = () => {
  return (
    <main className="min-h-screen bg-background dark:bg-background">
      <Header />
      <Hero />
      <FeaturedSection />
      <LatestPosts />
      <TrendingSection />
      <TopCategories />
      <TopAuthors />
      <NewsletterSection />
    </main>
  );
};

export default HomePage;
