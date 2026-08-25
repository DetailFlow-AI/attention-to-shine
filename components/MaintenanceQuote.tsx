"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

// ── Plan pricing ──────────────────────────────────────────────────────────────
// These adjustment rules are deliberately shown ONLY on this page — the main
// pricing section stays a clean two-tier list. Bases are monthly.

const PLANS = [
  {
    id: "essential" as const,
    name: "Essential",
    base: 100,
    details: "1 maintenance visit per month",
  },
  {
    id: "premium" as const,
    name: "Premium",
    base: 150,
    details: "2 maintenance visits per month",
  },
];

// Vehicle size is a single choice — a vehicle is one of these, never two.
const VEHICLE_TYPES = [
  { id: "car" as const, label: "Car, sedan or coupe", adj: 0 },
  { id: "crossover" as const, label: "Crossover or family-size vehicle", adj: 10 },
  { id: "truck" as const, label: "Truck or SUV", adj: 20 },
];

// Flat monthly add-ons, each independent of the others.
const KIDS_ADJ = 10;
const WORK_ADJ = 20;

type PlanId = (typeof PLANS)[number]["id"];
type VehicleId = (typeof VEHICLE_TYPES)[number]["id"];

export default function MaintenanceQuote() {
  const [planId, setPlanId] = useState<PlanId>("essential");
  const [vehicleId, setVehicleId] = useState<VehicleId>("car");
  const [kids, setKids] = useState(false);
  const [work, setWork] = useState(false);

  const plan = PLANS.find((p) => p.id === planId)!;
  const vehicle = VEHICLE_TYPES.find((v) => v.id === vehicleId)!;

  const lines = [
    { label: `${plan.name} plan — ${plan.details}`, amount: plan.base },
    ...(vehicle.adj ? [{ label: vehicle.label, amount: vehicle.adj }] : []),
    ...(kids ? [{ label: "Kids in the vehicle", amount: KIDS_ADJ }] : []),
    ...(work ? [{ label: "Work / job-site vehicle", amount: WORK_ADJ }] : []),
  ];
  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  const pillBase =
    "w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200";
  const pillOn = "border-gold bg-gold/10 text-white";
  const pillOff = "border-white/10 bg-white/5 text-white/70 hover:bg-white/[0.08]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-8">
        <fieldset>
          <legend className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">
            1 · Choose your plan
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                aria-pressed={planId === p.id}
                className={`${pillBase} ${planId === p.id ? pillOn : pillOff}`}
              >
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-sm text-white/50 mt-0.5">
                  ${p.base}/month · {p.details}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">
            2 · What are we caring for?
          </legend>
          <div className="space-y-3">
            {VEHICLE_TYPES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicleId(v.id)}
                aria-pressed={vehicleId === v.id}
                className={`${pillBase} ${
                  vehicleId === v.id ? pillOn : pillOff
                } flex items-center justify-between gap-4`}
              >
                <span>{v.label}</span>
                <span className="text-sm font-semibold text-gold whitespace-nowrap">
                  {v.adj ? `+$${v.adj}/mo` : "Included"}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">
            3 · Anything else we should plan for?
          </legend>
          <div className="space-y-3">
            {[
              {
                on: kids,
                set: setKids,
                label: "Kids ride in this vehicle",
                adj: KIDS_ADJ,
              },
              {
                on: work,
                set: setWork,
                label: "It's a work or job-site vehicle",
                adj: WORK_ADJ,
              },
            ].map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={() => row.set(!row.on)}
                aria-pressed={row.on}
                className={`${pillBase} ${
                  row.on ? pillOn : pillOff
                } flex items-center justify-between gap-4`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      row.on ? "bg-gold border-gold" : "border-white/30"
                    }`}
                  >
                    {row.on && <CheckCircle2 size={12} className="text-navy" />}
                  </span>
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-gold whitespace-nowrap">
                  +${row.adj}/mo
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Running estimate */}
      <div className="lg:col-span-2">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 lg:sticky lg:top-28">
          <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-5">
            Your estimate
          </p>

          <ul className="space-y-3 mb-5">
            {lines.map((l) => (
              <li
                key={l.label}
                className="flex justify-between gap-4 text-sm text-white/70"
              >
                <span>{l.label}</span>
                <span className="whitespace-nowrap">${l.amount}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-5">
            <span className="text-sm font-semibold text-white">
              Estimated monthly
            </span>
            <span className="text-4xl font-bold text-white leading-none">
              ${total}
              <span className="text-white/40 text-sm font-normal">/mo</span>
            </span>
          </div>

          <p className="text-xs text-white/40 mt-4 leading-relaxed">
            A rough estimate, not a final quote. We confirm your monthly rate
            after seeing the vehicle at your first detail.
          </p>

          <Link
            href="/booking"
            className="btn-gold w-full justify-center mt-6"
          >
            Book Your First Detail
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
