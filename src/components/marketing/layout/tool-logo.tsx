import { useState } from "react";
import { logoUrl } from "@/data/tools";
import { Tool } from "@/types";
import { LOGOS } from "@/data/logo-map";

const LOGO_OVERRIDES: Record<string, any> = {
  // Developer Tools
  "Firecrawl": "https://logos.hunter.io/firecrawl.dev",
  "Firecrawl Credits": "https://logos.hunter.io/firecrawl.dev",
  "Railway": "https://logos.hunter.io/railway.app",
  "Factory": "https://logos.hunter.io/factory.ai",
  "Warpbuild": "https://logos.hunter.io/warpbuild.com",
  "Bolt": "https://www.google.com/s2/favicons?domain=bolt.new&sz=128",

  // Design & Creative Tools
  "Adobe Creative Cloud": LOGOS["adobe-cc"],
  "Canva Pro": "https://logos.hunter.io/canva.com",
  "Canva Business + Leonardo AI": "https://logos.hunter.io/canva.com",
  "CapCut": "https://logos.hunter.io/capcut.com",
  "InVideo": "https://logos.hunter.io/invideo.io",
  "Gamma": "https://logos.hunter.io/gamma.app",
  "Descript": "https://logos.hunter.io/descript.com",
  "Leonardo AI": "https://logos.hunter.io/leonardo.ai",

  // Product Marketing
  "Customer.io": "https://logos.hunter.io/customer.io",
  "Mobbin Team": "https://logos.hunter.io/mobbin.com",
  "Guidless Pro": "https://logos.hunter.io/guideless.ai",

  // Business & Operations
  "Lead.CM": "https://www.google.com/s2/favicons?domain=leads.cm&sz=128",
  "TextShift": "https://www.google.com/s2/favicons?domain=textshift.org&sz=128",

  // OTT Platforms
  "Amazon Prime Video": "https://logos.hunter.io/primevideo.com",
  "JioHotstar": "https://logos.hunter.io/jiocinema.com",
  "SonyLIV": "https://upload.wikimedia.org/wikipedia/commons/f/f7/SonyLIV_2020.png",
  "ZEE 5": "https://logos.hunter.io/zee5.com",

  // Platform Credits
  "OpenAI Credits": "https://logos.hunter.io/openai.com",
  "AWS Credits": LOGOS["aws-credits"],
  "MongoDB Credits": "https://logos.hunter.io/mongodb.com",
  "Vapi Credits": "https://logos.hunter.io/vapi.ai",
  "Airtable Credits": "https://logos.hunter.io/airtable.com",
  "Render Credits": "https://logos.hunter.io/render.com",
  "Scalingo Credits": "https://logos.hunter.io/scalingo.com",
};

// Render a single stable logo source; explicit/local logos are preferred.
export function ToolLogo({
  tool,
  className = "h-8 w-8",
}: {
  tool: Tool;
  className?: string;
}) {
  // ONE stable source per tool.
  // Priority: explicit override logo → explicit local logo → simpleicons (slug) → branded favicon (domain).
  let primary: string | undefined = undefined;
  const override = LOGO_OVERRIDES[tool.name];
  if (override) {
    primary = typeof override === "object" && override !== null && "src" in override ? override.src : override;
  } else if (tool.logo) {
    primary = typeof tool.logo === "object" && tool.logo !== null && "src" in tool.logo ? tool.logo.src : tool.logo;
  } else if (tool.slug) {
    primary = logoUrl(tool);
  } else if (tool.domain) {
    primary = `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`;
  }

  const [failed, setFailed] = useState(false);

  if (!primary || failed) {
    return (
      <div
        className={`grid place-items-center rounded-md font-display text-[11px] font-extrabold uppercase tracking-tight text-white ${className}`}
        style={{ backgroundColor: `#${tool.color ?? "0A66C2"}` }}
        title={tool.name}
      >
        {tool.name
          .replace(/\b(Pro|Plus|Premium|Cloud|Credits|Business|Elements|Flow|Labs)\b/gi, "")
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)}
      </div>
    );
  }

  let scaleClass = "";
  if (tool.logo) {
    const nameLower = tool.name.toLowerCase();
    if (nameLower.includes("manus")) {
      scaleClass = "scale-[2.0]";
    } else if (nameLower.includes("fireflies")) {
      scaleClass = "scale-[2.2]";
    } else if (nameLower.includes("rezi")) {
      scaleClass = "scale-[2.2]";
    }
  }

  const isInverted = tool.color === "000000";

  return (
    <div className={`grid place-items-center p-0.5 overflow-hidden ${className}`}>
      <img
        src={primary}
        alt={tool.name}
        loading={tool.logo ? "eager" : "lazy"}
        className={`block h-full w-full object-contain object-center transition-transform ${scaleClass} ${isInverted ? "dark:invert" : ""}`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
