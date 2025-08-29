import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Globe,
  Shield,
  Award,
  Heart,
  Target,
  Zap,
  CheckCircle,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Trust & Security",
      description:
        "Every vendor undergoes thorough KYC verification to ensure quality and reliability.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community First",
      description:
        "Building strong connections between service providers and customers across Africa.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Innovation",
      description:
        "Leveraging technology to simplify service discovery and booking processes.",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Excellence",
      description:
        "Committed to delivering exceptional experiences for both customers and vendors.",
    },
  ];

  const stats = [
    { value: "500+", label: "Verified Vendors" },
    { value: "10,000+", label: "Happy Customers" },
    { value: "50+", label: "Cities Covered" },
    { value: "99%", label: "Success Rate" },
  ];

  const team = [
    {
      name: "Adebanjo Samson",
      role: "CEO & Founder",
      description:
        "Passionate about connecting African businesses with global opportunities.",
      image: "/team/ceo.jpg", // Add your image path here
      alt: "Adebanjo Samson - CEO & Founder of Bookhushly",
    },
    // {
    //   name: "Aboderin Daniel",
    //   role: "CTO",
    //   description:
    //     "Tech enthusiast building scalable solutions for the African market.",
    //   image: "/team/aboderin-daniel.jpg", // Add your image path here
    //   alt: "Aboderin Daniel - CTO of Bookhushly",
    // },
    // {
    //   name: "Adedeji Ifedayo",
    //   role: "Head of ICT",
    //   description:
    //     "Ensuring smooth operations and exceptional experiences through technology.",
    //   image: "/team/adedeji-ifedayo.jpg", // Add your image path here
    //   alt: "Adedeji Ifedayo - Head of ICT at Bookhushly",
    // },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay using hospitality colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 via-brand-800/85 to-hospitality-luxury/90"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-hospitality-gold/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-brand-400/10 rounded-full blur-3xl animate-float delay-2000"></div>
        </div>

        <div className="container relative z-20">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <Badge className="mb-4 glass text-white border-white/30 backdrop-blur-sm">
              🇳🇬 Made in Nigeria, Built for Africa
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6 text-balance">
              About Bookhushly
            </h1>
            <p className="text-xl text-white/90 mb-8 font-body text-balance">
              We&apos;re on a mission to connect Nigeria and Africa with quality
              hospitality, logistics, and security services through technology
              and trust.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 font-body">
                To revolutionize how Africans discover, book, and experience
                quality services by creating a trusted platform that empowers
                local businesses and delights customers.
              </p>
              <p className="text-muted-foreground mb-8 font-body">
                We believe that every African business deserves the opportunity
                to showcase their services to a wider audience, and every
                customer deserves access to verified, quality service providers
                in their area.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-brand-500" />
                  <span className="font-medium text-foreground">
                    Customer-Centric
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-hospitality-trust" />
                  <span className="font-medium text-foreground">
                    Africa-Wide
                  </span>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="bg-gradient-to-br from-brand-50 to-hospitality-warm rounded-3xl shadow-brand h-80 flex items-center justify-center transform hover:scale-105 transition-all duration-300">
                <div className="text-8xl opacity-30">🏢</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-hospitality-comfort">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
              Our Impact
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body text-balance">
              Numbers that reflect our commitment to connecting Africa through
              quality services
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center card-hospitality animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-3xl lg:text-4xl font-display font-bold text-brand-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-body">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body text-balance">
              The principles that guide everything we do at Bookhushly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center card-hospitality group hover:shadow-brand transition-all duration-300 transform hover:scale-105"
              >
                <CardHeader>
                  <div className="mx-auto mb-4 text-brand-500 group-hover:text-hospitality-gold transition-colors duration-300">
                    {value.icon}
                  </div>
                  <CardTitle className="text-lg font-display text-foreground">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Updated with Next.js Image optimization */}
      <section className="py-16 bg-hospitality-warm">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body text-balance">
              Passionate Africans building the future of service discovery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="text-center card-hospitality group hover:shadow-gold transition-all duration-300 transform hover:scale-105"
              >
                <CardHeader>
                  <div className="relative w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full ring-4 ring-brand-100 group-hover:ring-hospitality-gold transition-all duration-300">
                    <Image
                      src={member.image}
                      alt={member.alt}
                      fill
                      sizes="(max-width: 768px) 96px, 96px"
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                      priority={index === 0} // Prioritize loading the first image
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>
                  <CardTitle className="font-display text-foreground">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="font-medium text-brand-500 font-body">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-body">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
                Our Story
              </h2>
              <p className="text-muted-foreground font-body">
                How Bookhushly came to be
              </p>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6 font-body text-balance">
                Bookhushly was born from a simple observation: finding quality,
                reliable services in Nigeria and across Africa was unnecessarily
                difficult. Whether you needed a hotel for a business trip,
                catering for an event, or security services for your business,
                the process was fragmented, unreliable, and often frustrating.
              </p>
              <p className="text-muted-foreground mb-6 font-body text-balance">
                Our founders, having experienced these challenges firsthand,
                envisioned a platform where customers could easily discover
                verified service providers, and where local businesses could
                showcase their offerings to a broader audience.
              </p>
              <p className="text-muted-foreground mb-8 font-body text-balance">
                Today, Bookhushly serves thousands of customers and hundreds of
                verified vendors across Nigeria, with plans to expand throughout
                Africa. We're not just a booking platform – we're a community
                that celebrates African entrepreneurship and excellence.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-success-50 rounded-xl border border-success-100">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <span className="text-sm font-body font-medium text-success-900">
                  KYC Verified Vendors
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-hospitality-trust-light rounded-xl border border-hospitality-trust/20">
                <CheckCircle className="h-5 w-5 text-hospitality-trust" />
                <span className="text-sm font-body font-medium text-hospitality-trust">
                  Secure Payment Processing
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-brand-50 rounded-xl border border-brand-200">
                <CheckCircle className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-body font-medium text-brand-800">
                  24/7 Customer Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-hospitality-gold text-white overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="container text-center relative z-10">
          <h2 className="text-3xl font-display font-bold mb-4 text-balance">
            Join Our Mission
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto font-body text-balance">
            Whether you're a customer looking for quality services or a business
            ready to grow, we invite you to be part of the Bookhushly community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="btn-hospitality bg-white text-brand-600 hover:bg-hospitality-warm hover:shadow-soft focus:ring-2 focus:ring-white/50"
            >
              Get Started Today
            </a>
            <a
              href="/contact"
              className="btn-hospitality border-2 border-white text-white hover:bg-white/20 hover:shadow-soft focus:ring-2 focus:ring-white/50"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
