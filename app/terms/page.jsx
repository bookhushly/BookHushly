import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Legal Document
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Please read these terms carefully before using Bookhushly
            </p>
            <p className="text-sm text-primary-foreground/70 mt-4">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  1. Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to Bookhushly ("we," "our," or "us"). These Terms of
                  Service ("Terms") govern your use of our website, mobile
                  application, and services (collectively, the "Service")
                  operated by Bookhushly Limited.
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by
                  these Terms. If you disagree with any part of these terms,
                  then you may not access the Service.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Important Note
                      </p>
                      <p className="text-sm text-blue-700">
                        These terms apply to all users: customers, vendors, and
                        administrators.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  2. User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">2.1 Account Creation</h4>
                <p>
                  To use certain features of our Service, you must register for
                  an account. You may be required to provide certain personal
                  information, including but not limited to your name, email
                  address, and phone number.
                </p>

                <h4 className="font-semibold">2.2 Account Security</h4>
                <p>
                  You are responsible for safeguarding the password and for
                  maintaining the confidentiality of your account. You agree to
                  accept responsibility for all activities that occur under your
                  account.
                </p>

                <h4 className="font-semibold">2.3 User Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium text-primary">Customers</h5>
                    <p className="text-sm text-muted-foreground">
                      Users who book and pay for services through the platform
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium text-primary">Vendors</h5>
                    <p className="text-sm text-muted-foreground">
                      Service providers who list and offer services on the
                      platform
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Terms */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  3. Vendor Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">3.1 KYC Verification</h4>
                <p>
                  All vendors must complete Know Your Customer (KYC)
                  verification before listing services. This includes providing
                  valid business registration documents, identification, and
                  other required documentation.
                </p>

                <h4 className="font-semibold">3.2 Service Listings</h4>
                <p>
                  Vendors are responsible for providing accurate, complete, and
                  up-to-date information about their services, including
                  pricing, availability, and service descriptions.
                </p>

                <h4 className="font-semibold">3.3 Service Delivery</h4>
                <p>
                  Vendors must deliver services as described and agreed upon
                  with customers. Failure to deliver services may result in
                  account suspension or termination.
                </p>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Vendor Responsibilities
                      </p>
                      <p className="text-sm text-yellow-700">
                        Vendors are independent contractors and are solely
                        responsible for their services, taxes, and compliance
                        with local laws.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  4. Payments and Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">4.1 Platform Fees</h4>
                <p>
                  Bookhushly charges a platform fee of 5% on all successful
                  bookings. This fee is added to the service price and paid by
                  the customer.
                </p>

                <h4 className="font-semibold">4.2 Payment Processing</h4>
                <p>
                  All payments are processed through our secure payment partners
                  (Paystack and Flutterwave). We do not store payment
                  information on our servers.
                </p>

                <h4 className="font-semibold">4.3 Refunds</h4>
                <p>
                  Refund policies are set by individual vendors. Customers
                  should review the cancellation policy before booking. Platform
                  fees are non-refundable except in cases of vendor
                  non-performance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium">Customer Payments</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Service fee + 5% platform fee</li>
                      <li>• Secure payment processing</li>
                      <li>• Instant booking confirmation</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium">Vendor Payouts</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• 95% of service fee</li>
                      <li>• Weekly payout schedule</li>
                      <li>• Direct bank transfer</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Uses */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>5. Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">You may not use our Service:</p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>
                      For any unlawful purpose or to solicit others to perform
                      unlawful acts
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>
                      To violate any international, federal, provincial, or
                      state regulations, rules, laws, or local ordinances
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>
                      To infringe upon or violate our intellectual property
                      rights or the intellectual property rights of others
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>
                      To harass, abuse, insult, harm, defame, slander,
                      disparage, intimidate, or discriminate
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>To submit false or misleading information</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>6. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Bookhushly acts as a platform connecting customers with
                  service providers. We are not responsible for the quality,
                  safety, or legality of services provided by vendors.
                </p>
                <p>
                  In no case shall Bookhushly, our directors, officers,
                  employees, affiliates, agents, contractors, interns,
                  suppliers, service providers, or licensors be liable for any
                  injury, loss, claim, or any direct, indirect, incidental,
                  punitive, special, or consequential damages of any kind.
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>7. Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We may terminate or suspend your account immediately, without
                  prior notice or liability, for any reason whatsoever,
                  including without limitation if you breach the Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service will cease
                  immediately. If you wish to terminate your account, you may
                  simply discontinue using the Service.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>8. Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  These Terms shall be interpreted and governed by the laws of
                  the Federal Republic of Nigeria, without regard to its
                  conflict of law provisions. Any disputes arising from these
                  Terms shall be resolved in the courts of Lagos State, Nigeria.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>9. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will try to provide at least 30 days notice prior to any new
                  terms taking effect.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>10. Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> legal@bookhushly.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +234 901 234 5678
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
