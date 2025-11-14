// -- Add this at the top of the file --
import { useState } from "react";

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What experience level do I need to start?",
      answer:
        "None at all. Our fundamentals classes are designed for complete beginners. Coaches guide you through positions safely and at your pace.",
    },
    {
      question: "Do I need my own gi or equipment?",
      answer:
        "You can borrow a gi or no-gi gear for your first classes. Over time, most students purchase their own equipment, but it's not required at the start.",
    },
    {
      question: "How many classes should I attend each week?",
      answer:
        "Most beginners see great progress with 2–3 sessions per week. Advanced students often train 4–6 times, depending on goals and recovery.",
    },
    {
      question: "Is Brazilian Jiu-Jitsu safe?",
      answer:
        "Yes. Our coaches emphasise technique, control, and safety above all. You’ll learn how to tap early and train smart without injuries.",
    },
  ];

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="pt-20 px-6 max-w-6xl mx-auto space-y-20">

      {/* --- Your original About section stays unchanged --- */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="w-full">
          <img
            src="https://sixbladesdenver.com/wp-content/uploads/2024/09/DSC01477-768x548-1.jpg"
            alt="BJJ training"
            className="rounded-xl shadow-md w-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-gray-800">About Us</h3>

          <h3 className="text-3xl font-semibold text-gray-700 leading-snug">
            The BJJ Academy team helps your journey through life in many ways.
          </h3>

          <p className="text-lg text-gray-600 leading-relaxed">
            You will be welcomed into a community that supports your growth
            on and off the mats. Training improves discipline, confidence,
            physical fitness, and resilience. Our academy blends technical
            Brazilian Jiu-Jitsu instruction with a friendly, motivating
            environment — whether you're starting your first class or
            sharpening high-level skills.
          </p>

          <button className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition">
            Learn More (add link to new Contact Us page)
          </button>
        </div>
      </div>

      {/* --- FAQ Section --- */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-lg">
              <button
                className="w-full text-left px-6 py-4 flex justify-between items-center"
                onClick={() => toggle(i)}
              >
                <span className="text-lg font-medium text-gray-800">
                  {faq.question}
                </span>

                <span className="text-gray-600 text-xl">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
