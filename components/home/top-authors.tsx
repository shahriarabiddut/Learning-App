import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const authors = [
  {
    id: 1,
    name: "Sarah Johnson",
    bio: "Sustainability advocate and lifestyle writer",
    posts: 24,
    image: "/professional-woman-portrait.png",
    followers: 3200,
  },
  {
    id: 2,
    name: "Mike Chen",
    bio: "Tech enthusiast and innovation expert",
    posts: 18,
    image: "/professional-man-portrait.png",
    followers: 2800,
  },
  {
    id: 3,
    name: "Emma Davis",
    bio: "Home design and organization specialist",
    posts: 15,
    image: "/professional-woman-designer.png",
    followers: 2400,
  },
  {
    id: 4,
    name: "James Wilson",
    bio: "Travel writer and adventure seeker",
    posts: 12,
    image: "/professional-man-traveler.jpg",
    followers: 1900,
  },
]

export default function TopAuthors() {
  return (
    <section id="authors" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Authors</h2>
          <p className="text-muted-foreground">Meet the talented writers behind our best content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {authors.map((author) => (
            <Card key={author.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                    <Image src={author.image || "/placeholder.svg"} alt={author.name} fill className="object-cover" />
                  </div>
                </div>
                <CardTitle className="text-foreground">{author.name}</CardTitle>
                <CardDescription className="text-sm">{author.bio}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-lg font-bold text-primary">{author.posts}</p>
                    <p className="text-xs text-muted-foreground">Articles</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary">{author.followers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                </div>
                <Link href={`/author/${author.id}`}>
                  <Button
                    variant="outline"
                    className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent"
                  >
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
