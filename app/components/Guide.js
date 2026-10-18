"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { mountGuide } from "@/lib/guide";

export default function Guide({ firstName }) {
  const ref = useRef(null);
  const path = usePathname();
  useEffect(() => { if (ref.current) mountGuide(ref.current, { path, firstName }); }, [path, firstName]);
  return <div ref={ref} className="guide-root" />;
}
