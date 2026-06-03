"use client";

import { useSearchParams } from "next/navigation";
import BookingForm from "@/components/BookingForm";

export default function BookingFormWrapper() {
  const params = useSearchParams();
  const service = params.get("service") ?? undefined;
  return <BookingForm defaultService={service} />;
}
