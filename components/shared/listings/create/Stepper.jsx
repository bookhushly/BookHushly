import { motion } from "framer-motion";

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold shadow-md ${
                currentStep >= step.id
                  ? "bg-gradient-to-r from-purple-700 to-purple-800 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
              animate={{ scale: currentStep === step.id ? 1.15 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {step.id}
            </motion.div>
            <span className="text-sm mt-3 font-medium text-gray-700">
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <motion.div
              className={`flex-1 h-1 mx-4 ${
                currentStep > step.id ? "bg-purple-700" : "bg-gray-200"
              } rounded-full`}
              animate={{ width: currentStep > step.id ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
