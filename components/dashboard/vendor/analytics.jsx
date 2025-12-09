import { BarChart3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const AnalyticsTab = () => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Analytics & Insights
        </h2>
        <p className="text-slate-600 text-sm">
          Track your performance and growth metrics
        </p>
      </div>

      <Card className="bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
            <BarChart3 className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-900">
            Analytics Coming Soon
          </h3>
          <p className="text-slate-500 max-w-md">
            We&apos;re building comprehensive analytics to help you understand
            your business performance better
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
