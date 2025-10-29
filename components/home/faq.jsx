"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

// FAQ Data
const faqs = [
  {
    question: "How do I verify as a vendor?",
    answer:
      "After signing up as a vendor, you’ll be guided through our quick verification process. Upload your business credentials and relevant documents — once reviewed, your profile will display a verified badge.",
  },
  {
    question: "Is Bookhushly free to use?",
    answer:
      "Yes! Signing up and browsing services is completely free. Vendors only pay a small commission per successful booking, with no hidden charges.",
  },
  {
    question: "How secure are payments?",
    answer:
      "All transactions are handled through encrypted gateways and verified payment providers. Your financial information is never stored or shared with third parties.",
  },
  {
    question: "Can I cancel or modify a booking?",
    answer:
      "Yes, you can modify or cancel bookings based on each vendor’s policy. Bookhushly ensures transparent communication between you and the service provider.",
  },
  {
    question: "What kind of support can I expect?",
    answer:
      "Our dedicated support team is available 24/7 to help you with bookings, disputes, or vendor management. You can reach us anytime via chat or email.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-purple-50/25 to-white overflow-hidden">
      {/* Decorative background accent */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container max-w-4xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQs
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We’ve gathered answers to common questions from both customers and
            vendors to make your experience seamless.
          </p>
        </motion.div>

        {/* Accordion List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="border border-purple-100 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex justify-between items-center w-full px-6 py-5 text-left focus:outline-none"
                >
                  <span className="text-gray-900 font-medium text-lg">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-purple-600" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="overflow-hidden px-6 pb-5"
                    >
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
