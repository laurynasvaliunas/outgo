import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { legalDocuments } from "@/lib/legal";

export default function CommunityGuidelinesScreen() {
  return <LegalDocumentView document={legalDocuments.community} />;
}
