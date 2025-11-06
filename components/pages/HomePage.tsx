import Categories from "../home/categories";
import FeaturedSection from "../home/featured-section";
import Hero from "../home/hero";
import LatestPosts from "../home/latest-posts";
import NewsletterSection from "../home/newsletter-section";
import TopAuthors from "../home/top-authors";
import TrendingSection from "../home/trending-section";

const HomePage = () => {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedSection />
      <LatestPosts />
      <TopAuthors />
      <TrendingSection />
      <NewsletterSection />
    </>
  );
};

export default HomePage;
