import BetaAccessPage from "@/components/common/beta-access";

export const metadata = {
  title: "Profile | Vendor Dashboard | BookHushly",
};

export default function VendorProfilePage() {
  return (
    <BetaAccessPage
      featureName="Vendor Profile"
      featureDescription="Manage your business profile, upload documents, and configure your vendor settings all in one place."
      returnPath="/vendor/dashboard"
      returnLabel="Back to Dashboard"
    />
  );
}
