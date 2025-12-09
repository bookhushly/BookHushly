import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  User,
  ArrowRight,
  TrendingUp,
  Users,
  Building,
  Shield,
  Star,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function BlogPage() {
  const featuredPost = {
    id: 1,
    title: "The Future of African Hospitality: How Technology is Transforming Service Discovery",
    excerpt: "Explore how digital platforms are revolutionizing the way Africans discover and book quality services, from hotels to security services.",
    content: "The African hospitality and service industry is experiencing a digital transformation...",
    author: "Adebayo Johnson",
    authorRole: "CEO, Bookhushly",
    publishedAt: "2024-12-15T10:00:00Z",
    readTime: "8 min read",
    category: "Industry Insights",
    tags: ["Technology", "Africa", "Hospitality", "Digital Transformation"],
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
  }

  const blogPosts = [
    {
      id: 2,
      title: "5 Tips for Choosing the Perfect Event Venue in Lagos",
      excerpt: "Planning an event in Lagos? Here's your guide to finding the perfect venue that matches your budget and requirements.",
      author: "Fatima Abdullahi",
      authorRole: "Event Specialist",
      publishedAt: "2024-12-12T14:30:00Z",
      readTime: "5 min read",
      category: "Event Planning",
      tags: ["Events", "Lagos", "Venues"],
      image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "Building Trust in the Digital Age: Our KYC Verification Process",
      excerpt: "Learn how Bookhushly ensures vendor quality and customer safety through our comprehensive verification system.",
      author: "Chidi Okafor",
      authorRole: "Head of Operations",
      publishedAt: "2024-12-10T09:15:00Z",
      readTime: "6 min read",
      category: "Trust & Safety",
      tags: ["KYC", "Verification", "Trust", "Safety"],
      image: "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "The Rise of Mobile Payments in Nigeria: What It Means for Service Providers",
      excerpt: "How mobile payment solutions are making it easier for Nigerian businesses to accept payments and serve customers.",
      author: "Amina Hassan",
      authorRole: "Fintech Analyst",
      publishedAt: "2024-12-08T16:45:00Z",
      readTime: "7 min read",
      category: "Fintech",
      tags: ["Mobile Payments", "Nigeria", "Fintech", "Business"],
      image: "https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 5,
      title: "Customer Success Stories: How Bookhushly Transformed These Businesses",
      excerpt: "Real stories from vendors who have grown their businesses using our platform.",
      author: "Kemi Adebayo",
      authorRole: "Customer Success Manager",
      publishedAt: "2024-12-05T11:20:00Z",
      readTime: "4 min read",
      category: "Success Stories",
      tags: ["Success Stories", "Vendors", "Growth"],
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 6,
      title: "Security Best Practices for Online Service Bookings",
      excerpt: "Essential tips to keep your personal and payment information safe when booking services online.",
      author: "Tunde Ogundimu",
      authorRole: "Security Expert",
      publishedAt: "2024-12-03T13:10:00Z",
      readTime: "5 min read",
      category: "Security",
      tags: ["Security", "Online Safety", "Best Practices"],
      image: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 7,
      title: "The Economics of the Sharing Economy in Africa",
      excerpt: "Understanding how platforms like Bookhushly are contributing to economic growth across the continent.",
      author: "Dr. Ngozi Okonkwo",
      authorRole: "Economic Researcher",
      publishedAt: "2024-11-30T08:30:00Z",
      readTime: "9 min read",
      category: "Economics",
      tags: ["Sharing Economy", "Africa", "Economics", "Growth"],
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ]

  const categories = [
    { name: "All Posts", count: 25, active: true },
    { name: "Industry Insights", count: 8 },
    { name: "Event Planning", count: 5 },
    { name: "Trust & Safety", count: 4 },
    { name: "Fintech", count: 3 },
    { name: "Success Stories", count: 3 },
    { name: "Security", count: 2 }
  ]

  const getCategoryColor = (category) => {
    const colors = {
      "Industry Insights": "bg-blue-100 text-blue-800",
      "Event Planning": "bg-purple-100 text-purple-800",
      "Trust & Safety": "bg-green-100 text-green-800",
      "Fintech": "bg-yellow-100 text-yellow-800",
      "Success Stories": "bg-pink-100 text-pink-800",
      "Security": "bg-red-100 text-red-800",
      "Economics": "bg-indigo-100 text-indigo-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              📝 Insights & Stories
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Bookhushly Blog
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Insights, stories, and updates from the world of African hospitality and service innovation
            </p>
          </div>
        </div>
      </section>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Featured Post */}
            <div>
              <div className="flex items-center mb-6">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-2xl font-bold">Featured Article</h2>
              </div>
              
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-6xl opacity-50">📰</div>
                </div>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getCategoryColor(featuredPost.category)}>
                      {featuredPost.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{featuredPost.readTime}</span>
                  </div>
                  <CardTitle className="text-2xl leading-tight">
                    {featuredPost.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {featuredPost.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{featuredPost.author}</p>
                        <p className="text-xs text-muted-foreground">{featuredPost.authorRole}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(featuredPost.publishedAt), 'MMM d, yyyy')}
                      </div>
                      <Button size="sm">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Posts */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                      <div className="text-4xl opacity-50">📄</div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-xs font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(post.publishedAt), 'MMM d')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${category.active ? 'bg-primary/10 text-primary' : ''}`}>
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stay Updated</CardTitle>
                <CardDescription>
                  Get the latest insights delivered to your inbox
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                  <Button className="w-full">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  No spam, unsubscribe at any time
                </p>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Technology", "Africa", "Hospitality", "Events", "Security", "Fintech", "Growth", "Innovation", "Business", "Digital"].map((tag, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About Our Blog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The Bookhushly blog shares insights about the African service industry, 
                  technology trends, and stories from our community of vendors and customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}