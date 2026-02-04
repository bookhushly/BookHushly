// components/admin/vendors/VendorInfo.jsx
import { Badge } from "@/components/ui/badge";

// components/admin/vendors/VendorInfo.jsx - Update the Owner Name section
export function VendorInfo({ vendor }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
          <p className="mt-1 text-base text-gray-900">{vendor.business_name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <Badge variant="outline" className="mt-1">
            {vendor.business_category || "N/A"}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Owner Name</h3>
          <p className="mt-1 text-base text-gray-900">
            {vendor.users?.name || "N/A"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="mt-1 text-base text-gray-900">{vendor.users?.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
          <p className="mt-1 text-base text-gray-900">{vendor.phone_number}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">
            Years in Operation
          </h3>
          <p className="mt-1 text-base text-gray-900">
            {vendor.years_in_operation || "N/A"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">
          Business Description
        </h3>
        <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">
          {vendor.business_description}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Business Address</h3>
        <p className="mt-1 text-base text-gray-900">
          {vendor.business_address}
        </p>
      </div>

      {vendor.website_url && (
        <div>
          <h3 className="text-sm font-medium text-gray-500">Website</h3>
          <a
            href={vendor.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-base text-purple-600 hover:underline"
          >
            {vendor.website_url}
          </a>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Banking Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Bank Name</h4>
            <p className="mt-1 text-base text-gray-900">
              {vendor.bank_name || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Account Name</h4>
            <p className="mt-1 text-base text-gray-900">
              {vendor.bank_account_name || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Account Number
            </h4>
            <p className="mt-1 text-base text-gray-900">
              {vendor.bank_account_number || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {(vendor.business_registration_number ||
        vendor.tax_identification_number) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Legal Information
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {vendor.business_registration_number && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Registration Number
                </h4>
                <p className="mt-1 text-base text-gray-900">
                  {vendor.business_registration_number}
                </p>
              </div>
            )}
            {vendor.tax_identification_number && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">TIN</h4>
                <p className="mt-1 text-base text-gray-900">
                  {vendor.tax_identification_number}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-500">
          <div>
            <span className="font-medium">Joined:</span>{" "}
            {new Date(vendor.created_at).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{" "}
            {new Date(vendor.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
