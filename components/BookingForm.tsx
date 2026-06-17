"use client";

import { useState, useEffect } from "react";
import DatePicker from "@/components/DatePicker";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Car,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Tag,
  Info,
  AlertCircle,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ── Types ─────────────────────────────────────────────────────────────────────

type Service     = "exterior" | "interior" | "full" | "";
type VehicleSize = "sedan" | "suv" | "truck" | "";
type Step        = 1 | 2 | 3 | 4;

interface BookingData {
  service:      Service;
  vehicleSize:  VehicleSize;
  vehicleMake:  string;
  vehicleColor: string;
  date:         string;
  time:         string;
  address:      string;
  city:         string;
  zip:          string;
  notes:        string;
  name:         string;
  email:        string;
  phone:        string;
  promoCode:    string;
}

// ── Base pricing ───────────────────────────────────────────────────────────────

const BASE_PRICES: Record<string, number> = {
  exterior: 79.99,
  interior: 119.99,
  full:     159.99,
};

const SIZE_SURCHARGES: Record<string, number> = {
  sedan: 0,
  suv:   20,
  truck: 40,
};

const SERVICE_LABELS: Record<string, string> = {
  exterior: "Exterior Detail",
  interior: "Interior Detail",
  full:     "Full Detail Package",
};

const SIZE_LABELS: Record<string, string> = {
  sedan: "Sedan / Coupe",
  suv:   "SUV / Minivan",
  truck: "Large Truck / Van",
};

// ── Coating prices by vehicle size ─────────────────────────────────────────────

const COATING_PRICES: Record<string, number> = {
  sedan: 100,
  suv:   150,
  truck: 200,
};

// ── Keyword detection ──────────────────────────────────────────────────────────

interface DetectedUpcharges {
  hasPetHair:    boolean;
  hasStains:     boolean;
  hasCoating:    boolean;
  petHairAmount: number;
  stainsAmount:  number;
  coatingAmount: number;
  total:         number;
}

const PET_HAIR_KEYWORDS = [
  "pet hair", "dog hair", "cat hair", "animal hair",
  "pet fur", "dog fur", "cat fur", "fur",
];

const STAIN_KEYWORDS = [
  "heavy staining", "heavy stain", "staining",
  "stain", "stains",
];

const COATING_KEYWORDS = [
  "protection coating", "protective coating",
  "1 year coating", "one year coating",
  "add coating", "wax coating", "coating",
];

function detectUpcharges(notes: string, vehicleSize: VehicleSize): DetectedUpcharges {
  const lower = notes.toLowerCase();

  const hasPetHair = PET_HAIR_KEYWORDS.some((kw) => lower.includes(kw));
  const hasStains  = STAIN_KEYWORDS.some((kw) => lower.includes(kw));
  const hasCoating = COATING_KEYWORDS.some((kw) => lower.includes(kw));

  const petHairAmount = hasPetHair ? 20 : 0;
  const stainsAmount  = hasStains  ? 30 : 0;
  const coatingAmount = hasCoating ? (COATING_PRICES[vehicleSize] ?? 100) : 0;

  return {
    hasPetHair,
    hasStains,
    hasCoating,
    petHairAmount,
    stainsAmount,
    coatingAmount,
    total: petHairAmount + stainsAmount + coatingAmount,
  };
}

// ── Grand total calculator ─────────────────────────────────────────────────────

interface Pricing {
  base:          number;
  sizeSurcharge: number;
  upcharges:     DetectedUpcharges;
  preDiscount:   number;
  discount:      number;
  total:         number;
}

function calcPricing(
  service:     Service,
  size:        VehicleSize,
  notes:       string,
  promoCode:   string,
): Pricing {
  const base          = BASE_PRICES[service] ?? 0;
  const sizeSurcharge = SIZE_SURCHARGES[size] ?? 0;
  const upcharges     = detectUpcharges(notes, size);
  const preDiscount   = base + sizeSurcharge + upcharges.total;

  const discountApplies =
    promoCode.toUpperCase() === "SUMMER26" && preDiscount >= 200;
  const discount = discountApplies
    ? Math.round(preDiscount * 0.15 * 100) / 100
    : 0;

  return {
    base,
    sizeSurcharge,
    upcharges,
    preDiscount,
    discount,
    total: preDiscount - discount,
  };
}

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Service",  icon: <Car      size={14} /> },
  { num: 2, label: "Schedule", icon: <Calendar size={14} /> },
  { num: 3, label: "Details",  icon: <User     size={14} /> },
  { num: 4, label: "Payment",  icon: <CreditCard size={14} /> },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, idx) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step.num < current
                  ? "bg-gold text-white"
                  : step.num === current
                  ? "bg-navy text-white ring-4 ring-navy/10"
                  : "bg-apple-gray border border-apple-gray-2 text-apple-text-tertiary"
              }`}
            >
              {step.num < current ? <CheckCircle2 size={16} /> : step.num}
            </div>
            <span
              className={`text-[10px] font-medium hidden sm:block ${
                step.num === current
                  ? "text-navy"
                  : step.num < current
                  ? "text-gold"
                  : "text-apple-text-tertiary"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`h-px flex-1 mx-1 transition-all duration-300 ${
                step.num < current ? "bg-gold" : "bg-apple-gray-2"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Upcharge callout (shown in Step 2 after notes input) ──────────────────────

function UpchargeCallout({
  upcharges,
  vehicleSize,
}: {
  upcharges: DetectedUpcharges;
  vehicleSize: VehicleSize;
}) {
  const hasAny = upcharges.hasPetHair || upcharges.hasStains || upcharges.hasCoating;
  if (!hasAny) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
      <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
        <Info size={12} />
        Additional charges detected from your notes
      </p>
      <ul className="space-y-1.5">
        {upcharges.hasPetHair && (
          <li className="flex justify-between text-xs text-amber-700">
            <span>Pet hair removal</span>
            <span className="font-semibold">+${upcharges.petHairAmount.toFixed(2)}</span>
          </li>
        )}
        {upcharges.hasStains && (
          <li className="flex justify-between text-xs text-amber-700">
            <span>Stain treatment</span>
            <span className="font-semibold">+${upcharges.stainsAmount.toFixed(2)}</span>
          </li>
        )}
        {upcharges.hasCoating && (
          <li className="flex justify-between text-xs text-amber-700">
            <span>
              1-Year Protection Coating
              {vehicleSize ? ` (${SIZE_LABELS[vehicleSize]})` : ""}
            </span>
            <span className="font-semibold">+${upcharges.coatingAmount.toFixed(2)}</span>
          </li>
        )}
        <li className="flex justify-between text-xs text-amber-800 font-semibold border-t border-amber-200 pt-1.5 mt-1">
          <span>Additional charges total</span>
          <span>+${upcharges.total.toFixed(2)}</span>
        </li>
      </ul>
      {upcharges.hasCoating && (
        <p className="text-[10px] text-amber-600 mt-2 italic">
          * Coating rate applies to 2015 and newer models. Contact us if your vehicle is older.
        </p>
      )}
    </div>
  );
}

// ── Stripe payment form (step 4) ───────────────────────────────────────────────

function PaymentForm({
  onSuccess,
  total,
}: {
  onSuccess: (paymentIntentId?: string) => void;
  total: number;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [error,      setError]      = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Something went wrong.");
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/booking/success` },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed.");
      setProcessing(false);
    } else {
      onSuccess(paymentIntent?.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-apple-gray rounded-2xl p-4 border border-apple-gray-2">
        <PaymentElement />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-gold w-full justify-center text-base py-4"
      >
        {processing ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <>
            Pay ${total.toFixed(2)} & Confirm Booking
            <CreditCard size={16} />
          </>
        )}
      </button>
    </form>
  );
}

// ── Main booking form ──────────────────────────────────────────────────────────

export default function BookingForm({ defaultService }: { defaultService?: string }) {
  const [step,            setStep]           = useState<Step>(1);
  const [clientSecret,    setClientSecret]   = useState("");
  const [intentAmount,    setIntentAmount]   = useState(0);
  const [success,         setSuccess]        = useState(false);
  const [loading,         setLoading]        = useState(false);
  const [error,           setError]          = useState("");
  const [step2Attempted,  setStep2Attempted] = useState(false); // tracks if user tried to advance with missing fields
  const [payMethod,       setPayMethod]      = useState<"online" | "in_person">("online");
  const [busyRanges,      setBusyRanges]     = useState<{ start: string; end: string }[]>([]);
  const [nextAvailable,   setNextAvailable]  = useState<string>("");

  const [data, setData] = useState<BookingData>({
    service:      (defaultService as Service) || "",
    vehicleSize:  "",
    vehicleMake:  "",
    vehicleColor: "",
    date:         "",
    time:         "",
    address:      "",
    city:         "",
    zip:          "",
    notes:        "",
    name:         "",
    email:        "",
    phone:        "",
    promoCode:    "",
  });

  const set = (field: keyof BookingData, val: string) =>
    setData((d) => ({ ...d, [field]: val }));

  // Live pricing — recalculates whenever any relevant field changes
  const pricing = calcPricing(
    data.service,
    data.vehicleSize,
    data.notes,
    data.promoCode,
  );

  const timeSlots = [
    "7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
    "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Check the owner's Google Calendar whenever the chosen date changes.
  // Each response also carries the soonest date with an open slot.
  useEffect(() => {
    let cancelled = false;
    const query = data.date
      ? `date=${data.date}`
      : `start=${minDate}&days=1`; // no date picked yet — still fetch nextAvailable
    fetch(`/api/availability?${query}`)
      .then((r) => (r.ok ? r.json() : { busy: [] }))
      .then((j) => {
        if (cancelled) return;
        setBusyRanges(j.busy ?? []);
        if (j.nextAvailable) setNextAvailable(j.nextAvailable);
      })
      .catch(() => {
        if (!cancelled) setBusyRanges([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.date]);

  // Each booking reserves the 5 hours starting at its time (a 10:00 AM booking
  // blocks 10:00 AM–3:00 PM) — nothing before it. So a slot is bookable only if
  // a full 5-hour block starting there fits before the next booking, i.e. its
  // [X, X+5) window doesn't overlap any existing detail. Mirrors the calendar
  // block (BOOKING_BLOCK_HOURS) in lib/googleCalendar.ts.
  const DETAIL_HOURS = 5;

  // Parses a slot label like "12:00 PM" into a Date on the selected date.
  const slotToDate = (slot: string): Date | null => {
    if (!data.date) return null;
    const [hm, ap] = slot.split(" ");
    let hour = parseInt(hm, 10);
    if (ap === "PM" && hour !== 12) hour += 12;
    if (ap === "AM" && hour === 12) hour = 0;
    return new Date(`${data.date}T${String(hour).padStart(2, "0")}:00:00`);
  };

  // The soonest existing booking whose window overlaps the 5-hour block that
  // would start at `slot`, or null if a detail fits. Drives both the disabled
  // slots and the "detail at …" explanation.
  const conflictingBooking = (slot: string): Date | null => {
    if (!data.date || busyRanges.length === 0) return null;
    const slotStart = slotToDate(slot);
    if (!slotStart) return null;
    const detailEnd = new Date(slotStart.getTime() + DETAIL_HOURS * 60 * 60 * 1000);
    let earliest: Date | null = null;
    for (const b of busyRanges) {
      const busyStart = new Date(b.start);
      const busyEnd   = new Date(b.end);
      if (slotStart < busyEnd && detailEnd > busyStart) {
        if (!earliest || busyStart < earliest) earliest = busyStart;
      }
    }
    return earliest;
  };

  const isSlotBusy = (slot: string) => conflictingBooking(slot) !== null;

  // Formats a booking's start time in the business's timezone, e.g. "12:00 PM".
  const fmtBookingTime = (d: Date): string =>
    d.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });

  // The chosen time is valid only when a full detail fits before the next
  // booking. The Continue/Book buttons stay disabled until then.
  const selectedConflict = data.time ? conflictingBooking(data.time) : null;
  const timeIsValid      = !!data.time && selectedConflict === null;

  const submitPayLater = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit booking");
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const goToPayment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-payment-intent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service:       data.service,
          vehicleSize:   data.vehicleSize,
          promoCode:     data.promoCode,
          notes:         data.notes,        // ← passed for server-side upcharge detection
          customerName:  data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          date:          data.date,
          time:          data.time,
          address:       data.address,
          city:          data.city,
          zip:           data.zip,
          vehicleMake:   data.vehicleMake,
          vehicleColor:  data.vehicleColor,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to initialize payment");
      setClientSecret(json.clientSecret);
      setIntentAmount(json.amount / 100);
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Base input style — unchanged
  const inputClass =
    "w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200";

  // Returns the correct class string for a field.
  // requiredStep2: if true and step2Attempted and value is empty → red error state.
  const ic = (value: string, requiredStep2 = false) => {
    const hasError = requiredStep2 && step2Attempted && !value.trim();
    return hasError
      ? `${inputClass} border-red-400 bg-red-50 text-red-900 placeholder:text-red-400 focus:ring-red-200 focus:border-red-500`
      : `${inputClass} border-apple-gray-2 bg-white text-apple-text-primary placeholder:text-apple-text-tertiary focus:ring-navy/10 focus:border-navy`;
  };

  // Helper to show a "Required" error message under a field
  const RequiredMsg = ({ value }: { value: string }) =>
    step2Attempted && !value.trim() ? (
      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
        <AlertCircle size={11} />
        Required
      </p>
    ) : null;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-14 px-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-apple-text-primary tracking-tight mb-3">
          Booking confirmed!
        </h2>
        <p className="text-apple-text-secondary mb-2 max-w-md">
          Thank you, {data.name}! Your{" "}
          <strong>{SERVICE_LABELS[data.service]}</strong> is scheduled for{" "}
          <strong>{data.date}</strong> at <strong>{data.time}</strong>.
        </p>
        <p className="text-sm text-apple-text-tertiary max-w-sm">
          You'll receive a confirmation email at {data.email}. We'll text you
          30 minutes before arrival.
        </p>
        {payMethod === "in_person" && (
          <p className="text-sm text-apple-text-secondary bg-apple-gray border border-apple-gray-2 rounded-xl px-4 py-3 mt-4 max-w-sm">
            💵 You chose to pay in person — cash or card accepted once your
            detail is complete.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} />

      {/* ── STEP 1: Service + size ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-apple-text-primary mb-1">
              Choose your service
            </h2>
            <p className="text-sm text-apple-text-secondary">
              Select the detailing package that fits your needs.
            </p>
          </div>

          <div className="space-y-3">
            {(
              [
                { id: "exterior", name: "Exterior Detail",     price: "$79.99+",  desc: "Foam wash, rim cleaning, tire shine, sealant" },
                { id: "interior", name: "Interior Detail",     price: "$119.99+", desc: "Steam clean, vacuum, UV protection, odor treatment" },
                { id: "full",     name: "Full Detail Package", price: "$159.99+", desc: "Complete interior + exterior — best value", popular: true },
              ] as { id: Service; name: string; price: string; desc: string; popular?: boolean }[]
            ).map((svc) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => set("service", svc.id)}
                className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 relative ${
                  data.service === svc.id
                    ? "border-navy bg-navy/5"
                    : "border-apple-gray-2 bg-white hover:border-navy/30"
                }`}
              >
                {svc.popular && (
                  <span className="absolute top-3 right-3 bg-gold text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                      data.service === svc.id ? "border-navy bg-navy" : "border-apple-gray-2"
                    }`}
                  >
                    {data.service === svc.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-apple-text-primary">{svc.name}</span>
                      <span className="font-bold text-navy">{svc.price}</span>
                    </div>
                    <p className="text-sm text-apple-text-secondary mt-0.5">{svc.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Vehicle size */}
          <div>
            <label className="block text-xs font-medium text-apple-text-secondary mb-2">
              Vehicle Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { id: "sedan", label: "Sedan / Coupe",     adj: "Base price" },
                  { id: "suv",   label: "SUV / Minivan",     adj: "+$20" },
                  { id: "truck", label: "Truck / Van",       adj: "+$40" },
                ] as { id: VehicleSize; label: string; adj: string }[]
              ).map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => set("vehicleSize", sz.id)}
                  className={`rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                    data.vehicleSize === sz.id
                      ? "border-navy bg-navy/5"
                      : "border-apple-gray-2 bg-white hover:border-navy/30"
                  }`}
                >
                  <p className="text-xs font-semibold text-apple-text-primary">{sz.label}</p>
                  <p className="text-xs text-gold mt-0.5">{sz.adj}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Price preview */}
          {data.service && data.vehicleSize && (
            <div className="bg-apple-gray rounded-2xl p-4 border border-apple-gray-2 text-sm">
              <div className="flex justify-between text-apple-text-secondary">
                <span>{SERVICE_LABELS[data.service]}</span>
                <span>${BASE_PRICES[data.service].toFixed(2)}</span>
              </div>
              {SIZE_SURCHARGES[data.vehicleSize] > 0 && (
                <div className="flex justify-between text-apple-text-secondary mt-1">
                  <span>Vehicle size adjustment</span>
                  <span>+${SIZE_SURCHARGES[data.vehicleSize].toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-apple-text-primary border-t border-apple-gray-2 mt-2 pt-2">
                <span>Estimated starting total</span>
                <span>${(BASE_PRICES[data.service] + SIZE_SURCHARGES[data.vehicleSize]).toFixed(2)}+</span>
              </div>
              <p className="text-[10px] text-apple-text-tertiary mt-1">
                Additional charges may apply based on special notes in the next step.
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!data.service || !data.vehicleSize}
            className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── STEP 2: Schedule + location + notes ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-apple-text-primary mb-1">
              When &amp; where?
            </h2>
            <p className="text-sm text-apple-text-secondary">
              Pick your preferred date, time, and service location.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                Preferred Date *
              </label>
              <DatePicker
                value={data.date}
                minDate={minDate}
                onChange={(d) => set("date", d)}
              />
              <RequiredMsg value={data.date} />
            </div>
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                Preferred Time *
              </label>
              <select
                value={data.time}
                onChange={(e) => set("time", e.target.value)}
                className={ic(data.time, true)}
              >
                <option value="">Select a time</option>
                {timeSlots.map((t) => {
                  const conflict = conflictingBooking(t);
                  return (
                    <option key={t} value={t} disabled={conflict !== null}>
                      {conflict ? `${t} — detail at ${fmtBookingTime(conflict)}` : t}
                    </option>
                  );
                })}
              </select>
              <RequiredMsg value={data.time} />
              {selectedConflict && (
                <p className="text-red-500 text-xs mt-1.5 flex items-start gap-1 font-medium">
                  <AlertCircle size={11} className="mt-0.5 shrink-0" />
                  A detail is scheduled at {fmtBookingTime(selectedConflict)}.
                  Please select a time with at least 5 hours before that
                  appointment.
                </p>
              )}
              {nextAvailable && (
                <p className="text-xs text-apple-text-secondary mt-1.5">
                  Next available date:{" "}
                  <button
                    type="button"
                    onClick={() => set("date", nextAvailable)}
                    className="font-semibold text-gold hover:underline"
                  >
                    {new Date(`${nextAvailable}T12:00:00`).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </button>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
              Service Address *
            </label>
            <input
              type="text"
              placeholder="123 Main Street"
              value={data.address}
              onChange={(e) => set("address", e.target.value)}
              className={ic(data.address, true)}
            />
            <RequiredMsg value={data.address} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">City *</label>
              <input
                type="text"
                placeholder="Lakeland"
                value={data.city}
                onChange={(e) => set("city", e.target.value)}
                className={ic(data.city, true)}
              />
              <RequiredMsg value={data.city} />
            </div>
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">ZIP Code *</label>
              <input
                type="text"
                placeholder="33809"
                value={data.zip}
                onChange={(e) => set("zip", e.target.value)}
                maxLength={5}
                className={ic(data.zip, true)}
              />
              <RequiredMsg value={data.zip} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                Vehicle Make / Model
              </label>
              <input
                type="text"
                placeholder="e.g. Toyota Camry 2022"
                value={data.vehicleMake}
                onChange={(e) => set("vehicleMake", e.target.value)}
                className={ic(data.vehicleMake)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                Vehicle Color
              </label>
              <input
                type="text"
                placeholder="e.g. White"
                value={data.vehicleColor}
                onChange={(e) => set("vehicleColor", e.target.value)}
                className={ic(data.vehicleColor)}
              />
            </div>
          </div>

          {/* Notes with live upcharge detection */}
          <div>
            <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
              Special Notes (optional)
            </label>
            <textarea
              rows={4}
              placeholder={
                "Describe your vehicle's condition — e.g. pet hair, stains, or if you'd like the 1-Year Protection Coating added.\n\nOther details: access instructions, gate codes, etc."
              }
              value={data.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`}
            />

            {/* Auto-upcharge callout — appears as user types */}
            <UpchargeCallout
              upcharges={pricing.upcharges}
              vehicleSize={data.vehicleSize}
            />

            {/* Helper hint */}
            <p className="text-[11px] text-apple-text-tertiary mt-2">
              Mentioning pet hair (+$20), stains (+$30), or protection coating
              (+$100–$200 depending on vehicle) will automatically add those
              charges to your total.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep2Attempted(false); setStep(1); }}
              className="btn-outline flex-1 justify-center"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => {
                setStep2Attempted(true);
                // Only advance if every required field is filled and the
                // chosen time has a valid 5-hour runway after it
                if (
                  data.date.trim() &&
                  data.time.trim() &&
                  timeIsValid &&
                  data.address.trim() &&
                  data.city.trim() &&
                  data.zip.trim()
                ) {
                  setStep2Attempted(false); // reset for a clean state
                  setStep(3);
                }
                // If validation fails, the red fields + "Required" messages
                // appear automatically via step2Attempted = true
              }}
              disabled={!!selectedConflict}
              className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Contact info + full order summary ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-apple-text-primary mb-1">
              Your information
            </h2>
            <p className="text-sm text-apple-text-secondary">
              We'll use this to confirm your booking and reach you on the day.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="John Smith"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="john@email.com"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="(863) 000-0000"
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Promo code */}
          <div>
            <label className="block text-xs font-medium text-apple-text-secondary mb-1.5 flex items-center gap-1">
              <Tag size={11} /> Promo Code (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. SUMMER26"
              value={data.promoCode}
              onChange={(e) => set("promoCode", e.target.value.toUpperCase())}
              className={`${inputClass} uppercase`}
            />
            {data.promoCode.toUpperCase() === "SUMMER26" && pricing.discount > 0 && (
              <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Code applied — saving ${pricing.discount.toFixed(2)}!
              </p>
            )}
            {data.promoCode.toUpperCase() === "SUMMER26" && pricing.discount === 0 && (
              <p className="text-apple-text-tertiary text-xs mt-1.5">
                Discount applies to orders over $200.
              </p>
            )}
          </div>

          {/* ── Full order summary ── */}
          <div className="bg-apple-gray rounded-2xl p-5 border border-apple-gray-2 text-sm space-y-2">
            <h3 className="font-semibold text-apple-text-primary mb-3">Order Summary</h3>

            {/* Base service */}
            <div className="flex justify-between text-apple-text-secondary">
              <span>{SERVICE_LABELS[data.service]}</span>
              <span>${pricing.base.toFixed(2)}</span>
            </div>

            {/* Size surcharge */}
            {pricing.sizeSurcharge > 0 && (
              <div className="flex justify-between text-apple-text-secondary">
                <span>Vehicle size ({SIZE_LABELS[data.vehicleSize]})</span>
                <span>+${pricing.sizeSurcharge.toFixed(2)}</span>
              </div>
            )}

            {/* ── Note-detected upcharges ── */}
            {pricing.upcharges.hasPetHair && (
              <div className="flex justify-between text-amber-700">
                <span>Pet hair removal</span>
                <span>+${pricing.upcharges.petHairAmount.toFixed(2)}</span>
              </div>
            )}
            {pricing.upcharges.hasStains && (
              <div className="flex justify-between text-amber-700">
                <span>Stain treatment</span>
                <span>+${pricing.upcharges.stainsAmount.toFixed(2)}</span>
              </div>
            )}
            {pricing.upcharges.hasCoating && (
              <div className="flex justify-between text-amber-700">
                <span>
                  1-Year Protection Coating
                  {data.vehicleSize ? ` (${SIZE_LABELS[data.vehicleSize]})` : ""}
                </span>
                <span>+${pricing.upcharges.coatingAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Promo discount */}
            {pricing.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo discount (SUMMER26 — 15%)</span>
                <span>−${pricing.discount.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between font-bold text-apple-text-primary border-t border-apple-gray-2 pt-2 mt-1">
              <span>{payMethod === "in_person" ? "Estimated total — due after service" : "Total due today"}</span>
              <span>${pricing.total.toFixed(2)}</span>
            </div>

            {/* Appointment details */}
            <div className="text-xs text-apple-text-tertiary pt-1 space-y-0.5">
              <p>📅 {data.date} at {data.time}</p>
              <p>📍 {data.address}, {data.city}</p>
              {data.vehicleMake && <p>🚗 {data.vehicleMake}{data.vehicleColor ? ` · ${data.vehicleColor}` : ""}</p>}
            </div>

            {/* Coating year note — shown for all vehicle types */}
            {pricing.upcharges.hasCoating && (
              <p className="text-[10px] text-apple-text-tertiary italic border-t border-apple-gray-2 pt-2">
                * Coating rate applies to 2015 and newer models. Contact us if your vehicle is older.
              </p>
            )}
          </div>

          {/* ── Payment method choice ── */}
          <div>
            <label className="block text-xs font-medium text-apple-text-secondary mb-2">
              How would you like to pay?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayMethod("online")}
                className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                  payMethod === "online"
                    ? "border-navy bg-navy/5"
                    : "border-apple-gray-2 bg-white hover:border-navy/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={16} className="text-navy" />
                  <span className="font-semibold text-sm text-apple-text-primary">
                    Pay online now
                  </span>
                </div>
                <p className="text-xs text-apple-text-secondary">
                  Secure card payment through Stripe. Your booking is locked in
                  instantly.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("in_person")}
                className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                  payMethod === "in_person"
                    ? "border-navy bg-navy/5"
                    : "border-apple-gray-2 bg-white hover:border-navy/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Banknote size={16} className="text-navy" />
                  <span className="font-semibold text-sm text-apple-text-primary">
                    Pay in person
                  </span>
                </div>
                <p className="text-xs text-apple-text-secondary">
                  Book now, pay by cash or card after your detail is finished.
                </p>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 justify-center">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={payMethod === "online" ? goToPayment : submitPayLater}
              disabled={!data.name || !data.email || !data.phone || !timeIsValid || loading}
              className="btn-gold flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading…
                </>
              ) : payMethod === "online" ? (
                <>Proceed to Payment <ArrowRight size={16} /></>
              ) : (
                <>Confirm Booking <CheckCircle2 size={16} /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Payment ── */}
      {step === 4 && clientSecret && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-apple-text-primary mb-1">
              Secure payment
            </h2>
            <p className="text-sm text-apple-text-secondary">
              Your payment is encrypted and processed securely by Stripe.
            </p>
          </div>

          <div className="bg-navy text-white rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold">${intentAmount.toFixed(2)}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-white/70">{SERVICE_LABELS[data.service]}</p>
              <p className="text-white/50">{data.date} · {data.time}</p>
            </div>
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary:    "#0B1D36",
                  colorBackground: "#ffffff",
                  colorText:       "#1D1D1F",
                  borderRadius:    "12px",
                },
              },
            }}
          >
            <PaymentForm
              onSuccess={(paymentIntentId) => {
                setSuccess(true);
                // Add the appointment to the owner's calendar — fire and
                // forget so the success screen is never blocked on it
                if (paymentIntentId) {
                  fetch("/api/confirm-booking", {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ paymentIntentId }),
                  }).catch(() => {});
                }
              }}
              total={intentAmount}
            />
          </Elements>

          <button
            onClick={() => setStep(3)}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-apple-text-secondary hover:text-apple-text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Back to review
          </button>

          <p className="text-center text-xs text-apple-text-tertiary">
            🔒 Payments are processed by Stripe. We never store your card details.
          </p>
        </div>
      )}
    </div>
  );
}
