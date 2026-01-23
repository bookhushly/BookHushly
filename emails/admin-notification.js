import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export default function AdminNotificationEmail({
  requestId = "",
  requestType = "logistics",
  customerName = "Customer",
  customerPhone = "",
  customerEmail = "",
  serviceType = "",
  additionalDetails = {},
  dashboardUrl = "",
  isHighPriority = false,
}) {
  return (
    <Html>
      <Head />
      <Preview>New {requestType} service request requires attention</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>
              {isHighPriority ? "⚠️ " : ""}New{" "}
              {requestType === "logistics" ? "Logistics" : "Security"} Request
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {isHighPriority && (
              <Section style={alertBox}>
                <Text style={alertText}>
                  <strong>HIGH PRIORITY REQUEST</strong>
                  {additionalDetails.riskLevel &&
                    ` - ${additionalDetails.riskLevel.toUpperCase()} RISK LEVEL`}
                  {additionalDetails.previousIncidents && (
                    <>
                      <br />
                      Previous security incidents reported
                    </>
                  )}
                </Text>
              </Section>
            )}

            <Text style={text}>
              A new {requestType === "logistics" ? "logistics" : "security"}{" "}
              service request has been submitted and requires your attention.
            </Text>

            {/* Request Details Box */}
            <Section style={detailsBox}>
              <Heading style={h3}>Request Details</Heading>

              <Section style={detailRow}>
                <Text style={detailLabel}>Request ID:</Text>
                <Text style={detailValue}>{requestId.slice(0, 8)}...</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Customer:</Text>
                <Text style={detailValue}>{customerName}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Phone:</Text>
                <Text style={detailValue}>{customerPhone}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Email:</Text>
                <Text style={detailValue}>{customerEmail}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Service Type:</Text>
                <Text style={detailValue}>{serviceType}</Text>
              </Section>

              {/* Logistics specific */}
              {requestType === "logistics" && (
                <>
                  {additionalDetails.route && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Route:</Text>
                      <Text style={detailValue}>{additionalDetails.route}</Text>
                    </Section>
                  )}
                  {additionalDetails.pickupDate && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Pickup Date:</Text>
                      <Text style={detailValue}>
                        {additionalDetails.pickupDate}
                      </Text>
                    </Section>
                  )}
                  {additionalDetails.vehicleType && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Vehicle Type:</Text>
                      <Text style={detailValue}>
                        {additionalDetails.vehicleType}
                      </Text>
                    </Section>
                  )}
                </>
              )}

              {/* Security specific */}
              {requestType === "security" && (
                <>
                  {additionalDetails.location && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Location:</Text>
                      <Text style={detailValue}>
                        {additionalDetails.location}
                      </Text>
                    </Section>
                  )}
                  {additionalDetails.startDate && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Start Date:</Text>
                      <Text style={detailValue}>
                        {additionalDetails.startDate}
                      </Text>
                    </Section>
                  )}
                  {additionalDetails.personnel && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Personnel:</Text>
                      <Text style={detailValue}>
                        {additionalDetails.personnel}
                      </Text>
                    </Section>
                  )}
                  {additionalDetails.durationType && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Duration:</Text>
                      <Text style={detailValue}>
                        {additionalDetails.durationType}
                      </Text>
                    </Section>
                  )}
                  {additionalDetails.riskLevel && (
                    <Section style={detailRow}>
                      <Text style={detailLabel}>Risk Level:</Text>
                      <Text
                        style={{
                          ...detailValue,
                          fontWeight: "bold",
                          color:
                            additionalDetails.riskLevel === "critical" ||
                            additionalDetails.riskLevel === "high"
                              ? "#dc2626"
                              : "#059669",
                        }}
                      >
                        {additionalDetails.riskLevel.toUpperCase()}
                      </Text>
                    </Section>
                  )}
                </>
              )}
            </Section>

            {additionalDetails.specificThreats && (
              <Section style={detailsBox}>
                <Heading style={h3}>Specific Threats</Heading>
                <Text style={text}>{additionalDetails.specificThreats}</Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                View in Admin Dashboard
              </Button>
            </Section>

            <Text style={noteText}>
              Please review the request and provide a quote within 24 hours.
              {isHighPriority &&
                " This is a critical request requiring immediate attention."}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>BookHushly Admin Dashboard</Text>
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
  padding: "20px",
  textAlign: "center",
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const content = {
  padding: "20px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const h3 = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 15px",
};

const alertBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderLeft: "4px solid #dc2626",
  borderRadius: "4px",
  padding: "15px",
  margin: "20px 0",
};

const alertText = {
  color: "#991b1b",
  fontSize: "14px",
  margin: "0",
  lineHeight: "20px",
};

const detailsBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "15px",
  margin: "15px 0",
};

const detailRow = {
  marginBottom: "10px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  display: "inline-block",
  width: "120px",
};

const detailValue = {
  color: "#1f2937",
  fontSize: "14px",
  margin: "0",
  display: "inline-block",
};

const buttonContainer = {
  textAlign: "center",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#6d28d9",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 24px",
};

const noteText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "20px 0",
};

const footer = {
  padding: "20px",
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
