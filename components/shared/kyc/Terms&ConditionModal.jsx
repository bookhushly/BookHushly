import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Shield } from "lucide-react";

export function TermsAndConditionsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center"
        >
          Terms and Conditions
          <ExternalLink className="ml-1 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-white border border-gray-200 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
            <Shield className="mr-2 h-5 w-5 text-blue-500" />
            Vendor Terms and Conditions
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Please review these terms carefully before registering as a vendor
            on Bookhushly.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] sm:h-[60vh] pr-4">
          <div className="space-y-5 text-sm text-gray-700">
            {/* Section 1 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                1. Agreement Overview
              </h3>
              <p className="leading-relaxed">
                By registering as a vendor on{" "}
                <span className="font-medium">Bookhushly.com</span>
                (Platform), you agree to these legally binding Terms and
                Conditions, governed by the laws of the Federal Republic of
                Nigeria.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                2. Eligibility
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Own or have legal rights to manage the listed services or
                  properties.
                </li>
                <li>
                  Register with valid identification (e.g., NIN, CAC, or BVN, as
                  applicable).
                </li>
                <li>
                  Provide accurate and up-to-date information about your
                  services.
                </li>
                <li>
                  Comply with all local, state, and federal regulations for your
                  business category.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                3. Commission Structure
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  A <span className="font-medium">2.5% commission</span> is
                  charged on the total value of each successful booking after 3
                  months. Enjoy BookHushly for free until then!
                </li>
                <li>Commission is automatically deducted at payout.</li>
                <li>
                  The total booking value includes service fees, taxes, and any
                  additional charges (e.g., cleaning fees, VAT).
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                4. Payout Terms
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Payouts are made in Nigerian Naira (NGN) to your verified
                  local bank account.
                </li>
                <li>
                  Disbursement occurs within{" "}
                  <span className="font-medium">5 business days</span> after
                  guest check-in, minus commission and deductions.
                </li>
                <li>
                  Payouts may be delayed in cases of disputes or suspected
                  fraud.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                5. Taxes & Regulatory Compliance
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  You are responsible for all applicable taxes (e.g., VAT,
                  income tax).
                </li>
                <li>
                  Bookhushly may provide withholding tax certificates upon
                  request, per Nigerian FIRS rules.
                </li>
                <li>
                  Ensure tax compliance based on your business structure and
                  location.
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                6. Cancellations & Refunds
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Commission is payable if cancellation occurs outside your
                  defined cancellation window.
                </li>
                <li>
                  Clearly outline cancellation and refund policies for each
                  listing.
                </li>
                <li>
                  Bookhushly may override policies for guest protection in
                  exceptional cases.
                </li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                7. Vendor Conduct
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Fraudulent or misleading listings may result in removal and
                  legal action.
                </li>
                <li>
                  Comply with the Nigeria Data Protection Act (NDPA) for guest
                  data handling.
                </li>
                <li>
                  Maintain professional conduct in all interactions with guests
                  and Platform staff.
                </li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                8. Limitation of Liability
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Bookhushly is not liable for losses, damages, or disputes from
                  listings or guest actions.
                </li>
                <li>
                  Maintain adequate insurance for your services or properties.
                </li>
                <li>
                  The Platform is not responsible for guest behavior or property
                  damage.
                </li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                9. Account Termination
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Delist or pause listings anytime via your dashboard.</li>
                <li>
                  Bookhushly may suspend or terminate accounts for breaches or
                  12 months of inactivity.
                </li>
                <li>
                  Pending payouts (minus deductions) will be processed upon
                  termination.
                </li>
              </ul>
            </div>

            {/* Section 10 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                10. Dispute Resolution
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Disputes will be resolved in good faith, with arbitration in
                  Lagos under the Arbitration and Conciliation Act, Cap A18.
                </li>
                <li>
                  Each party bears its own legal costs unless otherwise agreed.
                </li>
              </ul>
            </div>

            {/* Section 11 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-gray-900">
                11. Amendments
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Bookhushly may update these Terms with prior notice.</li>
                <li>
                  Continued use after notice constitutes acceptance of revised
                  terms.
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() =>
              document.querySelector('[data-state="open"]')?.click()
            }
            className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all duration-300"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
