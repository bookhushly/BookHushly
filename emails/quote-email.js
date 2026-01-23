import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export default function QuoteEmail({
  customerName = "Customer",
  serviceType = "Logistics",
  requestType = "logistics",
  quoteDetails = {},
  totalAmount = 0,
  validUntil = new Date(),
  paymentLink = "#",
  routeInfo = null,
  dateInfo = null,
}) {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(totalAmount);

  const formattedDate = new Date(validUntil).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Html>
      <Head />
      <Preview>Your {serviceType} service quote from BookHushly</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>BookHushly</Heading>
            <Text style={headerSubtitle}>Your Service Quote is Ready</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h2}>Hello {customerName},</Heading>

            <Text style={text}>
              Thank you for requesting a quote for our{" "}
              {requestType === "logistics" ? "logistics" : "security"} services.
            </Text>

            <Text style={text}>
              We've reviewed your requirements and prepared a detailed quote for
              you.
            </Text>

            {/* Quote Details Box */}
            <Section style={quoteBox}>
              <Heading style={h3}>Quote Summary</Heading>

              <Section style={detailRow}>
                <Text style={detailLabel}>Service Type:</Text>
                <Text style={detailValue}>{serviceType}</Text>
              </Section>

              {routeInfo && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Route:</Text>
                  <Text style={detailValue}>{routeInfo}</Text>
                </Section>
              )}

              {dateInfo && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Date:</Text>
                  <Text style={detailValue}>{dateInfo}</Text>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailLabel}>Valid Until:</Text>
                <Text style={detailValue}>{formattedDate}</Text>
              </Section>

              <Hr style={divider} />

              <Section style={totalSection}>
                <Text style={totalLabel}>Total Amount:</Text>
                <Text style={totalAmount}>{formattedAmount}</Text>
              </Section>
            </Section>

            <Text style={text}>
              Please find your detailed quote attached as a PDF document.
            </Text>

            <Text style={text}>
              To proceed with this service, please make payment using the button
              below:
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={paymentLink}>
                Proceed to Payment
              </Button>
            </Section>

            <Text style={importantText}>
              <strong>Important:</strong> This quote is valid until{" "}
              {formattedDate}. Please complete payment before the expiry date to
              secure this rate.
            </Text>

            <Text style={text}>
              If you have any questions or need clarification, please don't
              hesitate to contact us.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              © {new Date().getFullYear()} BookHushly. All rights reserved.
            </Text>
            <Text style={footerText}>
              Nigeria's Premier Hospitality & Service Platform
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
};

const header = {
  backgroundColor: "#6d28d9",
  padding: "30px",
  textAlign: "center",
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const headerSubtitle = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "10px 0 0 0",
  padding: "0",
};

const content = {
  padding: "30px",
};

const h2 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 20px",
};

const h3 = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 15px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const quoteBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const detailRow = {
  marginBottom: "12px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  display: "inline-block",
  width: "140px",
};

const detailValue = {
  color: "#1f2937",
  fontSize: "14px",
  margin: "0",
  display: "inline-block",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const totalSection = {
  marginTop: "20px",
  paddingTop: "20px",
  borderTop: "2px solid #e5e7eb",
};

const totalLabel = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  display: "inline-block",
  width: "140px",
};

const totalAmount = {
  color: "#6d28d9",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
  display: "inline-block",
};

const buttonContainer = {
  textAlign: "center",
  margin: "32px 0",
};

const button = {
  backgroundColor: "#6d28d9",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "15px 30px",
};

const importantText = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "20px 0",
  padding: "12px",
  backgroundColor: "#fef2f2",
  borderLeft: "4px solid #dc2626",
  borderRadius: "4px",
};

const footer = {
  padding: "20px 30px",
};

const footerDivider = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  textAlign: "center",
  margin: "5px 0",
};
