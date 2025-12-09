import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users,
  Heart,
  Zap,
  Globe,
  Award,
  Coffee,
  Laptop,
  Plane,
  GraduationCap,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function CareersPage() {
  const openPositions = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Lagos, Nigeria",
      type: "Full-time",
      experience: "3-5 years",
      description: "Join our engineering team to build scalable solutions that connect millions of Africans with quality services.",
      requirements: ["React/Next.js", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      experience: "4-6 years",
      description: "Lead product strategy and development for our core platform, working closely with engineering and design teams.",
      requirements: ["Product Management", "Data Analysis", "User Research", "Agile", "B2B/B2C Experience"],
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "UX/UI Designer",
      department: "Design",
      location: "Abuja, Nigeria",
      type: "Full-time",
      experience: "2-4 years",
      description: "Design intuitive and beautiful user experiences that make service discovery delightful for our users.",
      requirements: ["Figma", "User Research", "Prototyping", "Design Systems", "Mobile Design"],
      posted: "3 days ago"
    },
    {
      id: 4,
      title: "Business Development Manager",
      department: "Sales",
      location: "Lagos, Nigeria",
      type: "Full-time",
      experience: "3-5 years",
      description: "Drive vendor acquisition and partnerships across Nigeria and West Africa.",
      requirements: ["B2B Sales", "Relationship Building", "Market Analysis", "Negotiation", "CRM"],
      posted: "5 days ago"
    },
    {
      id: 5,
      title: "Customer Success Specialist",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      experience: "1-3 years",
      description: "Ensure our customers and vendors have amazing experiences using our platform.",
      requirements: ["Customer Service", "Problem Solving", "Communication", "Data Analysis", "Empathy"],
      posted: "1 week ago"
    },
    {
      id: 6,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "3-5 years",
      description: "Build and maintain our infrastructure to ensure high availability and performance.",
      requirements: ["AWS/GCP", "Docker", "Kubernetes", "CI/CD", "Monitoring"],
      posted: "4 days ago"
    }
  ]

  const benefits = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness programs"
    },
    {
      icon: <Laptop className="h-6 w-6" />,
      title: "Remote-First",
      description: "Work from anywhere with flexible hours and home office setup"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Learning & Development",
      description: "Annual learning budget and conference attendance"
    },
    {
      icon: <Plane className="h-6 w-6" />,
      title: "Unlimited PTO",
      description: "Take time off when you need it to recharge and explore"
    },
    {
      icon: <Coffee className="h-6 w-6" />,
      title: "Team Retreats",
      description: "Quarterly team gatherings and annual company retreats"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Equity Package",
      description: "Share in our success with competitive equity compensation"
    }
  ]

  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "We build for the African community and put our users at the center of everything we do."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Move Fast",
      description: "We iterate quickly, learn from feedback, and aren't afraid to make bold decisions."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Think Big",
      description: "We're building for the entire continent and beyond, with solutions that scale."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Care Deeply",
      description: "We care about our work, our team, and the impact we're making on people's lives."
    }
  ]

  const stats = [
    { value: "50+", label: "Team Members" },
    { value: "8", label: "Countries" },
    { value: "2019", label: "Founded" },
    { value: "100%", label: "Remote-Friendly" }
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'Full-time': return 'bg-green-100 text-green-800'
      case 'Part-time': return 'bg-blue-100 text-blue-800'
      case 'Contract': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDepartmentColor = (department) => {
    const colors = {
      'Engineering': 'bg-blue-100 text-blue-800',
      'Product': 'bg-purple-100 text-purple-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Sales': 'bg-green-100 text-green-800',
      'Customer Success': 'bg-yellow-100 text-yellow-800',
      'Marketing': 'bg-orange-100 text-orange-800'
    }
    return colors[department] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Join Our Mission
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Help us connect Africa with quality services and build the future of hospitality technology
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide how we work, make decisions, and treat each other
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 text-primary">
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our growing team and help shape the future of African hospitality
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {openPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getDepartmentColor(position.department)}>
                          {position.department}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(position.type)}>
                          {position.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{position.posted}</span>
                      </div>
                      <CardTitle className="text-xl">{position.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {position.experience}
                        </div>
                      </div>
                    </div>
                    <Button>
                      Apply Now
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{position.description}</p>
                  <div>
                    <h4 className="font-medium mb-2">Key Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {position.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Don't see a role that fits? We're always looking for talented people.
            </p>
            <Button variant="outline">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Work With Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe in taking care of our team so they can do their best work
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="text-primary mb-2">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Culture */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Life at Bookhushly</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We're a diverse, passionate team working to solve real problems for millions of people across Africa. 
                  Our culture is built on trust, transparency, and the shared belief that technology can make life better.
                </p>
                <p className="text-muted-foreground">
                  Whether you're working from our Lagos office, your home, or a coffee shop in Cape Town, 
                  you'll be part of a team that values your unique perspective and supports your growth.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-primary">4.8/5</div>
                    <div className="text-sm text-muted-foreground">Employee Rating</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">Would Recommend</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-2xl h-80 flex items-center justify-center">
                <div className="text-8xl opacity-30">👥</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join us in building the future of African hospitality and service discovery. 
            Your work will directly impact millions of people across the continent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              View Open Positions
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
              Learn About Our Culture
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}