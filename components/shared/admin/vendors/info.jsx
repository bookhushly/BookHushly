// components/admin/vendors/VendorInfo.jsx
import { Badge } from "@/components/ui/badge";

// components/admin/vendors/VendorInfo.jsx - Update the Owner Name section
export function VendorInfo({ vendor }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</h3>
          <p className="mt-1 text-base text-gray-900 dark:text-white">{vendor.business_name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
          <Badge variant="outline" className="mt-1">
            {vendor.business_category || "N/A"}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner Name</h3>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {vendor.users?.name || "N/A"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
          <p className="mt-1 text-base text-gray-900 dark:text-white">{vendor.users?.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</h3>
          <p className="mt-1 text-base text-gray-900 dark:text-white">{vendor.phone_number}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Years in Operation
          </h3>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {vendor.years_in_operation || "N/A"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Business Description
        </h3>
        <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">
          {vendor.business_description}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Address</h3>
        <p className="mt-1 text-base text-gray-900 dark:text-white">
          {vendor.business_address}
        </p>
      </div>

      {vendor.website_url && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
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

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Banking Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</h4>
            <p className="mt-1 text-base text-gray-900 dark:text-white">
              {vendor.bank_name || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</h4>
            <p className="mt-1 text-base text-gray-900 dark:text-white">
              {vendor.bank_account_name || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Account Number
            </h4>
            <p className="mt-1 text-base text-gray-900 dark:text-white">
              {vendor.bank_account_number || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {(vendor.business_registration_number ||
        vendor.tax_identification_number) && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Legal Information
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {vendor.business_registration_number && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Registration Number
                </h4>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {vendor.business_registration_number}
                </p>
              </div>
            )}
            {vendor.tax_identification_number && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">TIN</h4>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {vendor.tax_identification_number}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-500 dark:text-gray-400">
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
