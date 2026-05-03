import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { legalDocuments } from "@/lib/legal";

export default function TermsScreen() {
  return <LegalDocumentView document={legalDocuments.terms} />;
}
