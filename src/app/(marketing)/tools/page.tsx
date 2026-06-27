import { ToolsPageClient } from "@/components/marketing/home/tools-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Subscriptions — SpendSmart Subscriptions",
  description: "Browse 150+ premium subscriptions: ChatGPT, Claude, LinkedIn Premium, Adobe, Microsoft Office, Cursor, Notion, Lovable, Replit & more. Up to 50% off.",
  openGraph: {
    title: "All Subscriptions — SpendSmart",
    description: "150+ premium AI, Professional & Creative subscriptions at up to 50% off.",
  },
};

export default function Page() {
  return <ToolsPageClient />;
}
