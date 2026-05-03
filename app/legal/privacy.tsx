import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { legalDocuments } from "@/lib/legal";

export default function PrivacyScreen() {
  return <LegalDocumentView document={legalDocuments.privacy} />;
}
