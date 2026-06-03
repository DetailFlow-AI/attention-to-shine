import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <section className="min-h-screen bg-apple-gray flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white rounded-3xl p-10 border border-apple-gray-2 shadow-sm text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-apple-text-primary tracking-tight mb-3">
          Booking confirmed!
        </h1>
        <p className="text-apple-text-secondary mb-2">
          Your payment was successful and your detail is booked.
        </p>
        <p className="text-sm text-apple-text-tertiary mb-8">
          Check your email for a confirmation. We'll text you 30 minutes before
          we arrive.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Back to Home <ArrowRight size={14} />
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
