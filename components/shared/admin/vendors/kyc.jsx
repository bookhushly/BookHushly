// components/admin/vendors/VendorKYC.jsx
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export function VendorKYC({ vendor }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">KYC Status</h3>
        <Badge
          variant={vendor.status === "approved" ? "success" : "warning"}
          className={
            vendor.status === "approved"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
          }
        >
          {vendor.status || "Pending"}
        </Badge>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Identity Documents
        </h3>
        <div className="space-y-4">
          {vendor.nin && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    National Identity Number
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.nin}</p>
                  {(vendor.nin_first_name || vendor.nin_last_name) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Name: {vendor.nin_first_name} {vendor.nin_last_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {vendor.drivers_license && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Driver's License</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {vendor.drivers_license}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!vendor.nin && !vendor.drivers_license && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No identity documents uploaded
            </p>
          )}
        </div>
      </div>

      {vendor.category_data && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Category Specific Data
          </h3>
          <pre className="bg-gray-50 dark:bg-gray-800 dark:text-gray-300 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(vendor.category_data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
