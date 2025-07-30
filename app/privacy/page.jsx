import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Globe,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Privacy & Security
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Your privacy is important to us. Learn how we collect, use, and
              protect your data.
            </p>
            <p className="text-sm text-primary-foreground/70 mt-4">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Bookhushly Limited ("we," "our," or "us") is committed to
                protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our platform.
              </p>
              <p>
                This policy applies to all users of our services, including
                customers, vendors, and website plators. By using our services,
                you consent to the data practices described in this policy.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Our Commitment
                    </p>
                    <p className="text-sm text-blue-700">
                      We are committed to transparency and giving you control
                      over your personal data.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">2.1 Personal Information</h4>
                <p className="mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium text-primary mb-2">
                      Account Information
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Name and email address</li>
                      <li>• Phone number</li>
                      <li>• Password (encrypted)</li>
                      <li>• Profile photo (optional)</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium text-primary mb-2">
                      Business Information (Vendors)
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Business name and description</li>
                      <li>• Business registration documents</li>
                      <li>• Tax identification numbers</li>
                      <li>• Banking information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">2.2 Usage Information</h4>
                <p>
                  We automatically collect certain information about your use of
                  our services:
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Device information (IP address, browser type, operating
                      system)
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Usage patterns and preferences</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Location data (with your permission)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Cookies and similar tracking technologies</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">2.3 Payment Information</h4>
                <p>
                  Payment information is processed by our secure payment
                  partners (Paystack and Flutterwave). We do not store complete
                  payment card information on our servers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the information we collect to:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium mb-2">Service Delivery</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Provide and maintain our services</li>
                    <li>• Process bookings and payments</li>
                    <li>• Facilitate communication between users</li>
                    <li>• Provide customer support</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Platform Improvement</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Analyze usage patterns</li>
                    <li>• Improve our algorithms</li>
                    <li>• Develop new features</li>
                    <li>• Ensure platform security</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Communication</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Send booking confirmations</li>
                    <li>• Provide service updates</li>
                    <li>• Send marketing communications (with consent)</li>
                    <li>• Respond to inquiries</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Legal Compliance</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Comply with legal obligations</li>
                    <li>• Prevent fraud and abuse</li>
                    <li>• Enforce our terms of service</li>
                    <li>• Protect user safety</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                4. Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may share your information in the following circumstances:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium">With Service Providers</h5>
                  <p className="text-sm text-muted-foreground">
                    We share necessary information with vendors to facilitate
                    service delivery (e.g., contact details for confirmed
                    bookings).
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-medium">With Payment Processors</h5>
                  <p className="text-sm text-muted-foreground">
                    Payment information is shared with Paystack and Flutterwave
                    to process transactions securely.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h5 className="font-medium">For Legal Compliance</h5>
                  <p className="text-sm text-muted-foreground">
                    We may disclose information when required by law or to
                    protect our rights and safety.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h5 className="font-medium">Business Transfers</h5>
                  <p className="text-sm text-muted-foreground">
                    In the event of a merger, acquisition, or sale, user
                    information may be transferred as part of the business
                    assets.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      We Never Sell Your Data
                    </p>
                    <p className="text-sm text-red-700">
                      We do not sell, rent, or trade your personal information
                      to third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                5. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h5 className="font-medium">Encryption</h5>
                  <p className="text-sm text-muted-foreground">
                    Data encrypted in transit and at rest
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-medium">Access Control</h5>
                  <p className="text-sm text-muted-foreground">
                    Strict access controls and authentication
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h5 className="font-medium">Monitoring</h5>
                  <p className="text-sm text-muted-foreground">
                    Continuous security monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                6. Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You have the following rights regarding your personal
                information:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-primary mb-2">
                    Access & Portability
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Request a copy of your data</li>
                    <li>• Export your information</li>
                    <li>• View data processing activities</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-primary mb-2">
                    Control & Correction
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Update your information</li>
                    <li>• Correct inaccurate data</li>
                    <li>• Manage communication preferences</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-primary mb-2">
                    Deletion & Restriction
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Request data deletion</li>
                    <li>• Restrict processing</li>
                    <li>• Object to certain uses</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-primary mb-2">
                    Consent Management
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Withdraw consent</li>
                    <li>• Opt-out of marketing</li>
                    <li>• Manage cookie preferences</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                To exercise these rights, please contact us at
                privacy@bookhushly.com. We will respond to your request within
                30 days.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                7. International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Your information may be transferred to and processed in
                countries other than Nigeria. We ensure that such transfers are
                subject to appropriate safeguards, including standard
                contractual clauses and adequacy decisions.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="space-y-1">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Provide our services to you</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Comply with legal obligations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Resolve disputes and enforce agreements</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Maintain business records for legitimate purposes</span>
                </li>
              </ul>
              <p>
                When we no longer need your information, we will securely delete
                or anonymize it.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our services are not intended for children under 18 years of
                age. We do not knowingly collect personal information from
                children under 18. If you are a parent or guardian and believe
                your child has provided us with personal information, please
                contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. For material
                changes, we will provide additional notice.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> privacy@bookhushly.com
                </p>
                <p>
                  <strong>Phone:</strong> +234 901 234 5678
                </p>
                <p>
                  <strong>Address:</strong> Victoria Island, Lagos, Nigeria
                </p>
                <p>
                  <strong>Data Protection Officer:</strong> dpo@bookhushly.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
