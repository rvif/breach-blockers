import { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  MessageSquare,
  Clock,
  ChevronDown,
} from "lucide-react";
import Button from "../components/ui/Button";

const FAQ = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="bg-gray-50/50 dark:bg-cyber-black/50 rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors
          hover:text-cyber-green focus:outline-none"
        onClick={onClick}
      >
        <h4 className="font-medium text-gray-900 dark:text-white">
          {question}
        </h4>
        <ChevronDown
          className={`h-5 w-5 text-cyber-green transform transition-transform duration-200
            ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
        className={`transition-all duration-200 ease-in-out
          ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const maxMessageLength = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "info", message: "Sending..." });

    try {
      // Add your contact form submission logic here
      setStatus({ type: "success", message: "Message sent successfully!" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    }
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxMessageLength) {
      setFormData((prev) => ({ ...prev, message: text }));
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "support@br3achbl0ckers.com",
      description: "Send us an email anytime!",
    },
    {
      icon: MapPin,
      title: "Location",
      details: "Cyber Security Hub",
      description: "Digital Avenue, Tech District",
    },
    {
      icon: Clock,
      title: "Response Time",
      details: "24/7 Support",
      description: "We usually respond within 2 hours",
    },
  ];

  const faqs = [
    {
      question: "How quickly will I receive a response?",
      answer: "We typically respond within 2 hours during business hours.",
    },
    {
      question: "What information should I include?",
      answer:
        "Please provide as much detail as possible about your inquiry or issue.",
    },
    {
      question: "Is my information secure?",
      answer:
        "All communications are encrypted and handled with strict confidentiality.",
    },
  ];

  // Update all input fields with this className
  const inputClassName = `w-full px-3 py-2 bg-gray-50 dark:bg-cyber-black border border-gray-300 
    dark:border-cyber-green rounded focus:ring-1 focus:ring-cyber-green/50 dark:focus:ring-cyber-green 
    focus:border-cyber-green dark:focus:border-cyber-green transition-colors
    selection:bg-cyber-green selection:bg-opacity-30 selection:text-gray-900 dark:selection:text-white`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Get in Touch
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Have questions about our platform? Want to report a vulnerability?
          We're here to help!
        </p>
      </div>

      {/* Main Content - Side by Side with fixed heights */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <div className="flex-1 h-fit relative bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-8">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyber-green/20 to-transparent rounded-tr-lg -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyber-green/10 to-transparent rounded-bl-lg -z-10" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {status.message && (
              <div
                className={`p-4 rounded-lg ${
                  status.type === "error"
                    ? "bg-red-500/10 text-red-500 border border-red-500"
                    : "bg-cyber-green/10 text-cyber-green border border-cyber-green"
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[240px] group">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="peer w-full px-4 py-3 bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
                      focus:border-cyber-green dark:focus:border-cyber-green outline-none transition-colors
                      placeholder-transparent"
                    placeholder="Name"
                  />
                  <label
                    className="absolute left-4 -top-5 text-sm text-gray-600 dark:text-gray-400
                    peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                    peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-cyber-green 
                    peer-focus:text-sm transition-all"
                  >
                    Name
                  </label>
                </div>
              </div>

              <div className="flex-1 min-w-[240px] group">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="peer w-full px-4 py-3 bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
                      focus:border-cyber-green dark:focus:border-cyber-green outline-none transition-colors
                      placeholder-transparent"
                    placeholder="Email"
                  />
                  <label
                    className="absolute left-4 -top-5 text-sm text-gray-600 dark:text-gray-400
                    peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                    peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-cyber-green 
                    peer-focus:text-sm transition-all"
                  >
                    Email
                  </label>
                </div>
              </div>
            </div>

            <div className="relative group">
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="peer w-full px-4 py-3 bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
                  focus:border-cyber-green dark:focus:border-cyber-green outline-none transition-colors
                  placeholder-transparent"
                placeholder="Subject"
              />
              <label
                className="absolute left-4 -top-5 text-sm text-gray-600 dark:text-gray-400
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-cyber-green 
                peer-focus:text-sm transition-all"
              >
                Subject
              </label>
            </div>

            <div className="relative group">
              <textarea
                required
                rows="4"
                value={formData.message}
                onChange={handleMessageChange}
                maxLength={maxMessageLength}
                className="peer w-full px-4 py-3 bg-transparent border-2 border-gray-300 dark:border-gray-600 
                  focus:border-cyber-green dark:focus:border-cyber-green outline-none transition-colors rounded-lg
                  placeholder-transparent resize-none"
                placeholder="Message"
              />
              <label
                className="absolute left-4 -top-5 text-sm text-gray-600 dark:text-gray-400
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-cyber-green 
                peer-focus:text-sm transition-all"
              >
                Message
              </label>
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                {formData.message.length}/{maxMessageLength}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full relative overflow-hidden rounded-lg py-4 text-lg font-medium 
                transition-all duration-200 active:scale-[0.99]
                hover:shadow-[0_0_10px_rgba(0,200,150,0.15)] dark:hover:shadow-[0_0_15px_rgba(0,200,150,0.15)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Send
                  className="h-5 w-5 transition-all duration-300 ease-out 
                    group-hover:transform group-hover:-translate-y-1 group-hover:translate-x-1 
                    group-hover:text-cyber-green dark:group-hover:text-cyber-green"
                />
                <span>Send Message</span>
              </span>
              <div
                className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-cyber-green/20 to-emerald-100/50
                  dark:from-cyber-green/10 dark:via-cyber-green/20 dark:to-cyber-green/10 animate-shimmer"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite",
                }}
              />
            </Button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="lg:w-[400px] bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQ
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === index}
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === index ? null : index)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
