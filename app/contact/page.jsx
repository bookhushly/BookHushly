"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitted(true);
      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours",
      });
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again or contact us directly",
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Us",
      details: "help@bookhushly.com",
      description: "Send us an email anytime",
      color: "text-brand-500",
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Call Us",
      details: "+447493810995",
      description: "Mon-Fri 9AM-6PM WAT",
      color: "text-hospitality-trust",
    },

    {
      icon: <Clock className="h-5 w-5" />,
      title: "Business Hours",
      details: "24/7",
      description: "Monday to Friday (WAT)",
      color: "text-brand-600",
    },
  ];

  const faqItems = [
    {
      question: "How do I become a verified vendor?",
      answer:
        "Register as a vendor, complete your KYC verification with business documents, and wait for admin approval. The process typically takes 2-3 business days.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major payment methods through Paystack and Flutterwave, including cards, bank transfers, USSD, and mobile money.",
    },
    {
      question: "How do I cancel a booking?",
      answer:
        "You can cancel bookings from your dashboard. Refund policies vary by vendor, but most offer free cancellation up to 24 hours before the service date.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, all payments are processed through PCI DSS compliant payment processors. We never store your payment information on our servers.",
    },
  ];

  if (submitted) {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="text-center card-hospitality animate-fade-in">
          <CardHeader>
            <div className="mx-auto mb-4 text-success-500 animate-fade-in">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl font-display text-success-600">
              Message Sent!
            </CardTitle>
            <CardDescription className="font-body">
              Thank you for contacting us. We'll get back to you within 24
              hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="btn-hospitality border-brand-500 text-brand-600 hover:bg-brand-50"
            >
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-hospitality-luxury text-white py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-hospitality-gold/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-64 bg-brand-400/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6 text-balance">
              Get in Touch
            </h1>
            <p className="text-xl text-white/90 font-body text-balance">
              Have questions? We're here to help. Reach out to our team anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="card-hospitality hover:shadow-brand transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center font-display text-foreground">
                    <MessageSquare className="mr-2 h-5 w-5 text-brand-500" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="font-body">
                    Fill out the form below and we'll get back to you as soon as
                    possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="font-body font-medium text-foreground"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleChange}
                          className="font-body focus:ring-brand-500 focus:border-brand-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="font-body font-medium text-foreground"
                        >
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="font-body focus:ring-brand-500 focus:border-brand-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="subject"
                        className="font-body font-medium text-foreground"
                      >
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        className="font-body focus:ring-brand-500 focus:border-brand-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="type"
                        className="font-body font-medium text-foreground"
                      >
                        Message Type
                      </Label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm font-body focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="vendor">Vendor Application</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="message"
                        className="font-body font-medium text-foreground"
                      >
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="font-body focus:ring-brand-500 focus:border-brand-500"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full btn-hospitality bg-brand-500 hover:bg-brand-600 text-white shadow-brand"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          <span className="font-body">Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          <span className="font-body">Send Message</span>
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="card-hospitality hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-display text-foreground">
                    Contact Information
                  </CardTitle>
                  <CardDescription className="font-body">
                    Multiple ways to reach our team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-xl bg-hospitality-warm/50 hover:bg-hospitality-warm transition-colors duration-300"
                    >
                      <div className={`${info.color} mt-1`}>{info.icon}</div>
                      <div>
                        <h4 className="font-medium font-body text-foreground">
                          {info.title}
                        </h4>
                        <p
                          className={`text-sm font-medium font-body ${info.color}`}
                        >
                          {info.details}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-hospitality hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-display text-foreground">
                    Quick Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm font-body">
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-success-50">
                      <CheckCircle className="h-4 w-4 text-success-600" />
                      <span className="text-success-800">
                        General inquiries: 2-4 hours
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-hospitality-trust-light">
                      <CheckCircle className="h-4 w-4 text-hospitality-trust" />
                      <span className="text-hospitality-trust">
                        Technical support: 1-2 hours
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-brand-50">
                      <CheckCircle className="h-4 w-4 text-brand-600" />
                      <span className="text-brand-800">
                        Vendor applications: 24-48 hours
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-hospitality-comfort">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body text-balance">
              Quick answers to common questions about Bookhushly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <Card
                key={index}
                className="card-hospitality hover:shadow-brand transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-display text-foreground text-balance">
                    {item.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-body text-balance">
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16">
        <div className="container">
          <Card className="max-w-2xl mx-auto text-center card-hospitality border-danger-200 hover:shadow-hard transition-all duration-300">
            <CardHeader>
              <div className="mx-auto mb-4 text-danger-500">
                <AlertTriangle className="h-12 w-12" />
              </div>
              <CardTitle className="text-danger-600 font-display">
                Emergency Support
              </CardTitle>
              <CardDescription className="font-body">
                For urgent issues requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-body text-balance">
                  If you're experiencing a critical issue that affects your
                  safety or security, please contact us immediately:
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="destructive"
                    className="btn-hospitality bg-danger-500 hover:bg-danger-600 shadow-hard"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    <span className="font-body">
                      Emergency: +234 901 234 5678
                    </span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  Available 24/7 for critical issues
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
