import type { Metadata } from "next";
import { LegalDocumentView } from "@/domains/legal/LegalDocumentView";
import { PRIVACY } from "@/domains/legal/privacy";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 나 VS 나",
};

export default function PrivacyPage() {
  return <LegalDocumentView document={PRIVACY} />;
}
