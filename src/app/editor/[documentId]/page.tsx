import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfEditor } from "@/components/pdf-editor/pdf-editor";
import { UploadPanel } from "@/components/upload/upload-panel";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/utils/errors";
import { getCurrentUser } from "@/modules/auth/current-user";
import { resolveActor } from "@/modules/documents/actor";
import { getOwnedDocument } from "@/modules/documents/service";

export const metadata: Metadata = { title: "Éditeur de signature", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditorPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  if (documentId === "new") {
    return <div className="px-4 py-12"><UploadPanel /></div>;
  }
  const actor = await resolveActor();
  if (!actor) notFound();
  let doc;
  try {
    doc = await getOwnedDocument(getDb(), actor, documentId);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
  const user = await getCurrentUser();
  return <PdfEditor documentId={doc.id} title={doc.title} initiallySigned={doc.signedKey !== null} signedIn={user !== null} />;
}
