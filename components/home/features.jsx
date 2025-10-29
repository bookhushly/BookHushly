import { Badge, Clock, Search, Shield, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Smart Discovery",
      description:
        "AI-powered search to find the perfect service provider for your specific needs across Africa.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Verified Excellence",
      description:
        "Every vendor undergoes rigorous KYC verification ensuring premium quality and reliability.",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Instant Booking",
      description:
        "Book services instantly with real-time availability and immediate confirmation.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Trusted Reviews",
      description:
        "Make informed decisions with authentic reviews from verified customers.",
    },
  ];
  return (
    <section className="py-24 bg-gradient-to-br from-blue-950 via-purple-950 to-indigo-900 text-white relative overflow-hidden">
      {/* Enhanced Background Patterns */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Refined dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-20 h-20 border border-white/20 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-32 left-16 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-bounce-slow"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold px-4 py-2 text-sm">
            Why Choose Bookhushly?
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Built for African Excellence
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            We provide a secure, reliable platform that connects you with the
            finest service providers across the continent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden"
            >
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Animated border */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full animation-duration-1000"></div>

              <CardHeader className="text-center relative z-10 pb-6">
                <div className="mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <CardDescription className="text-blue-100 leading-relaxed group-hover:text-white transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardContent>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Card>
          ))}
        </div>

        {/* Call to action section */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-white">
              Join 50,000+ satisfied customers across Africa
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
