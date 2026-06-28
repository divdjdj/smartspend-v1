"use client";

import { useState } from "react";
import { Share2, Copy, MessageSquare, X, Mail, Link, } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface QuickShareWidgetProps {
  referralCode: string | null;
}

export function QuickShareWidget({ referralCode }: QuickShareWidgetProps) {
  const [copied, setCopied] = useState(false);

  const getReferralLink = () => {
    if (!referralCode) return "";
    return `${window.location.origin}/ref/${referralCode}`;
  };

  const shareText = "Hey! Check out SpentSmart to manage and optimize your premium subscriptions. Sign up using my link to get a ₹500 discount on your first subscription purchase!";

  const handleCopyLink = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!referralCode) return;
    const text = `${shareText}\n\n${getReferralLink()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleTwitterShare = () => {
    if (!referralCode) return;
    const text = `${shareText}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getReferralLink())}`, "_blank");
  };

  const handleLinkedInShare = () => {
    if (!referralCode) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getReferralLink())}`, "_blank");
  };

  const handleEmailShare = () => {
    if (!referralCode) return;
    const subject = "Get ₹500 off your SpentSmart subscription!";
    const body = `${shareText}\n\nHere is my referral link: ${getReferralLink()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div id="share-widget" className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-5 relative overflow-hidden">
      {/* Overlay glow */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand/10 blur-[40px] pointer-events-none" />

      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
        <Share2 className="h-4 w-4 text-brand" /> Invite & Earn ₹500
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Share your referral link. Friends get <strong className="text-foreground">₹500 OFF</strong> on their first subscription, and you earn cash rewards!
      </p>

      {referralCode ? (
        <div className="space-y-4 pt-2">
          {/* Code display */}
          <div className="flex justify-between items-center bg-soft/20 border border-border/5 rounded-xl px-4 py-3 text-xs font-semibold">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Your Unique Link</span>
            <span className="font-mono text-brand font-bold tracking-wider truncate max-w-[150px] sm:max-w-full">
              .../ref/{referralCode}
            </span>
          </div>

          <Button
            onClick={handleCopyLink}
            className="w-full h-11 text-xs font-semibold rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <Copy className="h-4 w-4" /> {copied ? 'Copied to Clipboard!' : 'Copy Referral Link'}
          </Button>

          <div className="pt-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">Share via</p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleWhatsAppShare} size="icon" variant="outline" className="rounded-full h-10 w-10 bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/20">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button onClick={handleTwitterShare} size="icon" variant="outline" className="rounded-full h-10 w-10 bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20">
                <X className="h-4 w-4" />
              </Button>
              <Button onClick={handleLinkedInShare} size="icon" variant="outline" className="rounded-full h-10 w-10 bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20 hover:bg-[#0A66C2]/20">
                <Link className="h-4 w-4" />
              </Button>
              <Button onClick={handleEmailShare} size="icon" variant="outline" className="rounded-full h-10 w-10 bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 border border-dashed border-border/20 rounded-2xl bg-soft/10 text-xs text-muted-foreground flex flex-col items-center justify-center">
          <Share2 className="h-8 w-8 text-brand/40 mb-3" />
          <p>Please generate a referral link in the Referrals portal to start earning.</p>
        </div>
      )}
    </div>
  );
}
