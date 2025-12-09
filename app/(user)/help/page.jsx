import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Book,
  CreditCard,
  Shield,
  Users,
  Building,
  Star,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <Book className="h-5 w-5" />,
      faqs: [
        {
          question: "How do I create an account?",
          answer:
            "Click 'Register' in the top navigation, choose your role (Customer or Vendor), fill in your details, and verify your email. It's that simple!",
        },
        {
          question:
            "What's the difference between Customer and Vendor accounts?",
          answer:
            "Customer accounts let you browse and book services. Vendor accounts allow you to list your services and accept bookings after KYC verification.",
        },
        {
          question: "Is Bookhushly free to use?",
          answer:
            "Yes! Creating an account and browsing services is completely free. We only charge a small platform fee (5%) on successful bookings.",
        },
      ],
    },
    {
      title: "Booking Services",
      icon: <Search className="h-5 w-5" />,
      faqs: [
        {
          question: "How do I book a service?",
          answer:
            "Browse services, select one you like, click 'Book Now', fill in your details, and make payment. You'll receive instant confirmation.",
        },
        {
          question: "Can I cancel my booking?",
          answer:
            "Yes, cancellation policies vary by vendor. Most offer free cancellation up to 24 hours before the service date. Check the specific policy before booking.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major payment methods through Paystack and Flutterwave, including cards, bank transfers, USSD, and mobile money.",
        },
        {
          question: "How do I know if my booking is confirmed?",
          answer:
            "You'll receive email confirmations immediately after booking. The vendor will also confirm your booking within 24 hours.",
        },
      ],
    },
    {
      title: "For Vendors",
      icon: <Building className="h-5 w-5" />,
      faqs: [
        {
          question: "How do I become a verified vendor?",
          answer:
            "Register as a vendor, complete your KYC verification with business documents, and wait for admin approval. The process typically takes 2-3 business days.",
        },
        {
          question: "What documents do I need for KYC?",
          answer:
            "You'll need business registration documents, tax identification, bank account details, and valid ID. All documents should be clear and up-to-date.",
        },
        {
          question: "How do I get paid?",
          answer:
            "Payments are processed weekly to your registered bank account. You receive 95% of the booking amount (we keep 5% as platform fee).",
        },
        {
          question: "Can I manage my availability?",
          answer:
            "Yes! You can update your availability status, manage bookings, and set your own cancellation policies through your vendor dashboard.",
        },
      ],
    },
    {
      title: "Payments & Billing",
      icon: <CreditCard className="h-5 w-5" />,
      faqs: [
        {
          question: "Is my payment information secure?",
          answer:
            "Absolutely! All payments are processed through PCI DSS compliant payment processors. We never store your payment information on our servers.",
        },
        {
          question: "What is the platform fee?",
          answer:
            "We charge a 5% platform fee on all successful bookings. This fee covers payment processing, customer support, and platform maintenance.",
        },
        {
          question: "How do refunds work?",
          answer:
            "Refunds are processed according to the vendor's cancellation policy. Approved refunds are processed within 5-7 business days to your original payment method.",
        },
        {
          question: "Can I get a receipt for my booking?",
          answer:
            "Yes! You'll receive a detailed receipt via email after payment. You can also download receipts from your customer dashboard.",
        },
      ],
    },
    {
      title: "Safety & Trust",
      icon: <Shield className="h-5 w-5" />,
      faqs: [
        {
          question: "How do you verify vendors?",
          answer:
            "All vendors undergo thorough KYC verification including business registration, tax documents, and identity verification before approval.",
        },
        {
          question: "What if I have issues with a vendor?",
          answer:
            "Contact our support team immediately. We investigate all complaints and take appropriate action to ensure customer satisfaction.",
        },
        {
          question: "How do reviews work?",
          answer:
            "Only customers who have completed bookings can leave reviews. This ensures all reviews are from verified customers with real experiences.",
        },
        {
          question: "Is my personal information safe?",
          answer:
            "Yes! We follow strict data protection policies and never share your personal information with third parties without your consent.",
        },
      ],
    },
  ];

  const quickHelp = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageSquare className="h-6 w-6" />,
      action: "Start Chat",
      available: "24/7",
    },
    {
      title: "Call Support",
      description: "Speak directly with our team",
      icon: <Phone className="h-6 w-6" />,
      action: "+234 901 234 5678",
      available: "9 AM - 6 PM WAT",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: <Mail className="h-6 w-6" />,
      action: "support@bookhushly.com",
      available: "24 hours response",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              How Can We Help?
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Find answers to common questions or get in touch with our support
              team
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the best way to reach our support team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickHelp.map((help, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto mb-4 text-primary">{help.icon}</div>
                  <CardTitle className="text-lg">{help.title}</CardTitle>
                  <CardDescription>{help.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full mb-2">{help.action}</Button>
                  <Badge variant="secondary" className="text-xs">
                    {help.available}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to the most common questions about Bookhushly
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {category.icon}
                    <span className="ml-2">{category.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`item-${categoryIndex}-${faqIndex}`}
                      >
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
            <p className="text-muted-foreground">
              More ways to get the help you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Community Forum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with other users and share experiences
                </p>
                <Button variant="outline" size="sm">
                  Visit Forum
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Book className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">User Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Step-by-step tutorials and guides
                </p>
                <Button variant="outline" size="sm">
                  Read Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tips for getting the most out of Bookhushly
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Status Page</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Check platform status and updates
                </p>
                <Button variant="outline" size="sm">
                  View Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help
            you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20"
            >
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
