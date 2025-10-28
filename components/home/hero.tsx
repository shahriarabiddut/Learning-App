export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Discover Stories That Inspire
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Explore insightful articles, expert perspectives, and thought-provoking content from our community of
            writers.
          </p>
          <div className="flex gap-4 justify-center">
            <input
              type="text"
              placeholder="Search articles..."
              className="px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
