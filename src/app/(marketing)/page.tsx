import { HomePageClient } from "@/components/marketing/home/home/home-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpendSmart Subscriptions — Premium AI & Professional Tools at 50% Off",
  description: "Same subscriptions. Lower prices. Get LinkedIn Premium, ChatGPT Plus, Adobe, Microsoft Office, Canva, Cursor & 150+ premium tools at up to 50% off. Trusted by 850+ professionals.",
};

export default function Page() {
  return <HomePageClient />;
}
