import type { Metadata } from "next";
import { LegalDocumentView } from "@/domains/legal/LegalDocumentView";
import { TERMS } from "@/domains/legal/terms";

export const metadata: Metadata = {
  title: "이용약관 — 나 VS 나",
};

export default function TermsPage() {
  return <LegalDocumentView document={TERMS} />;
}
