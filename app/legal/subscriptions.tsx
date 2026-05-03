import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { legalDocuments } from "@/lib/legal";

export default function SubscriptionTermsScreen() {
  return <LegalDocumentView document={legalDocuments.subscriptions} />;
}
