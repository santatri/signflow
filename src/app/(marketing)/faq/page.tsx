import type { Metadata } from "next";
import { faqItems } from "@/config/faq";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Foire aux questions</h1>
      <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card">
        {faqItems.map((item) => (
          <details key={item.question} className="p-4">
            <summary className="cursor-pointer font-medium">{item.question}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
