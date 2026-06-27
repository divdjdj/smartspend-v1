import { LOGOS as RAW_LOGOS } from "@/data/logo-map";
import { Tool } from "@/types";
import { StaticImageData } from "next/image";

const LOGOS = RAW_LOGOS as Record<string, StaticImageData>;

const courseraLogo = LOGOS["coursera"];

const marqueeLogo = (name: string) =>
  LOGOS[`marquee-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`];

// Brand colors (hex without #) so simpleicons returns colored transparent SVGs.
export const TOP_TOOLS: Tool[] = [
  { name: "ChatGPT Plus", slug: "openai", color: "10A37F", category: "AI", logo: LOGOS["chatgpt-plus"] },
  { name: "Claude Pro", slug: "anthropic", color: "D97757", category: "AI", logo: LOGOS["claude-pro"] },
  { name: "Gemini Pro", slug: "googlegemini", color: "4285F4", category: "AI", logo: LOGOS["gemini-pro"] },
  { name: "Cursor Pro", slug: "cursor", color: "000000", category: "Developer", logo: LOGOS["cursor-pro"] },
  { name: "LinkedIn Premium", slug: "linkedin", color: "0A66C2", category: "Professional", logo: LOGOS["linkedin-premium"] },
  { name: "Adobe Creative Cloud", slug: "adobecreativecloud", color: "DA1F26", category: "Creative", logo: LOGOS["adobe-cc"] },
  { name: "Microsoft Office", slug: "microsoftoffice", color: "D83B01", category: "Professional", logo: LOGOS["ms-office"] },
  { name: "Canva Pro", slug: "canva", color: "00C4CC", category: "Creative", logo: LOGOS["canva-pro"] },
  { name: "Notion Business", slug: "notion", color: "000000", category: "Productivity" },
  { name: "Replit", slug: "replit", color: "F26207", category: "Developer", logo: LOGOS["replit"] },
  { name: "Supabase Pro", slug: "supabase", color: "3FCF8E", category: "Developer", logo: LOGOS["supabase-pro"] },
  { name: "ElevenLabs", slug: "elevenlabs", color: "000000", category: "AI", domain: "elevenlabs.io" },
  { name: "n8n", slug: "n8n", color: "EA4B71", category: "Developer", logo: LOGOS["n8n"] },
  { name: "Lovable Pro", slug: "", color: "FF4D8D", category: "Developer", logo: LOGOS["lovable-pro"] },
  { name: "Envato", slug: "envato", color: "8B5CF6", category: "Creative", logo: LOGOS["elements"] },
];

// Inner ring = most famous, instantly-recognised subscriptions.
export const ORBIT_INNER: Tool[] = [
  { name: "ChatGPT Plus", slug: "openai", color: "10A37F", category: "AI", logo: LOGOS["chatgpt-plus"] },
  { name: "Claude Pro", slug: "anthropic", color: "D97757", category: "AI", logo: LOGOS["claude-pro"] },
  { name: "Gemini Pro", slug: "googlegemini", color: "4285F4", category: "AI", logo: LOGOS["gemini-pro"] },
  { name: "Adobe CC", slug: "adobecreativecloud", color: "DA1F26", category: "Creative", logo: LOGOS["adobe-cc"] },
  { name: "Canva Pro", slug: "canva", color: "00C4CC", category: "Creative", logo: LOGOS["canva-pro"] },
  { name: "Microsoft Office", slug: "microsoftoffice", color: "D83B01", category: "Professional", logo: LOGOS["ms-office"] },
  { name: "LinkedIn Premium", slug: "linkedin", color: "0A66C2", category: "Professional", logo: LOGOS["linkedin-premium"] },
  { name: "Notion Business", slug: "notion", color: "000000", category: "Productivity" },
  { name: "Cursor Pro", slug: "cursor", color: "000000", category: "Developer", logo: LOGOS["cursor-pro"] },
  { name: "Lovable Pro", slug: "", color: "FF4D8D", category: "Developer", logo: LOGOS["lovable-pro"] },
  { name: "ElevenLabs", slug: "elevenlabs", color: "000000", category: "AI", domain: "elevenlabs.io" },
];

// Outer ring = the remaining provided logos, no repeats with the inner ring.
export const ORBIT_OUTER: Tool[] = [
  { name: "Replit", slug: "replit", color: "F26207", category: "Developer", logo: LOGOS["replit"] },
  { name: "Supabase Pro", slug: "supabase", color: "3FCF8E", category: "Developer", logo: LOGOS["supabase-pro"] },
  { name: "n8n", slug: "n8n", color: "EA4B71", category: "Developer", logo: LOGOS["n8n"] },
  { name: "Bolt", slug: "", color: "111827", category: "Developer", logo: LOGOS["bolt"] },
  { name: "Whispr Flow", slug: "", color: "111827", category: "AI", logo: LOGOS["whisper-flow"] },
  { name: "InVideo", slug: "invideo", color: "3B82F6", category: "Creative", logo: LOGOS["invideo"] },
  { name: "Gamma Pro", slug: "gamma", color: "8B5CF6", category: "Productivity", logo: LOGOS["gamma-pro"] },
  { name: "Envato", slug: "envato", color: "8B5CF6", category: "Creative", logo: LOGOS["elements"] },
  { name: "AWS Credits", slug: "amazonwebservices", color: "FF9900", category: "Credits", logo: LOGOS["aws-credits"] },
  { name: "GitHub Copilot", slug: "githubcopilot", color: "24292e", category: "Developer" },
  { name: "Grok", slug: "grok", color: "000000", category: "AI", logo: LOGOS["grok"] },
  { name: "Figma Pro", slug: "figma", color: "F24E1E", category: "Creative", logo: LOGOS["figma"] },
  { name: "Apify Credits", slug: "apify", color: "F86606", category: "Credits", logo: LOGOS["apify"] },
  { name: "Coursera Plus", slug: "coursera", color: "0056D2", category: "Professional" },
  { name: "NordVPN", slug: "nordvpn", color: "4687FF", category: "Professional" },
  { name: "Perplexity Pro", slug: "perplexity", color: "1F1F1F", category: "AI" },
];

export const ORBIT_TOOLS: Tool[] = [...ORBIT_INNER, ...ORBIT_OUTER];

// Curated top-demand subscriptions for the homepage logo grid.
// Order is tuned for visual recognition first.
export const TOP_DEMAND_TOOLS: Tool[] = [
  // PROFESSIONAL TOOLS
  { name: "LinkedIn Premium", slug: "linkedin", color: "0A66C2", category: "Professional", logo: LOGOS["linkedin-premium"] },
  { name: "Microsoft Office", slug: "microsoftoffice", color: "D83B01", category: "Professional", logo: LOGOS["ms-office"] },
  { name: "Coursera Plus", slug: "coursera", color: "0056D2", category: "Professional" },
  { name: "Rezi - Resume builder", slug: "rezi", color: "1F2937", category: "Professional", logo: LOGOS["marquee-rezi"] },
  { name: "NordVPN", slug: "nordvpn", color: "4687FF", category: "Professional" },

  // AI ASSISTANTS
  { name: "ChatGPT Plus", slug: "openai", color: "10A37F", category: "AI", logo: LOGOS["chatgpt-plus"] },
  { name: "Claude AI", slug: "anthropic", color: "D97757", category: "AI", logo: LOGOS["claude-pro"] },
  { name: "Google Gemini", slug: "googlegemini", color: "4285F4", category: "AI", logo: LOGOS["gemini-pro"] },
  { name: "Perplexity Pro", slug: "perplexity", color: "1F1F1F", category: "AI" },
  { name: "Grok", slug: "grok", color: "000000", category: "AI", logo: LOGOS["grok"] },
  { name: "ElevenLabs", slug: "elevenlabs", color: "000000", category: "AI", domain: "elevenlabs.io" },
  { name: "Notion Business + AI", slug: "notion", color: "000000", category: "Productivity" },
  { name: "Manus pro", slug: "manus", color: "111827", category: "AI", logo: LOGOS["marquee-manus-pro"] },
  { name: "Fireflies Pro", slug: "fireflies", color: "F59E0B", category: "Productivity", logo: LOGOS["marquee-fireflies-pro"] },
  { name: "Wispr Flow", slug: "", color: "6366F1", category: "AI", logo: LOGOS["whisper-flow"] },

  // DEVELOPER TOOLS
  { name: "Cursor Pro", slug: "cursor", color: "000000", category: "Developer", logo: LOGOS["cursor-pro"] },
  { name: "GitHub Copilot", slug: "githubcopilot", color: "24292e", category: "Developer" },
  { name: "Lovable Pro & Lite", slug: "", color: "FF4D8D", category: "Developer", logo: LOGOS["lovable-pro"] },
  { name: "Replit", slug: "replit", color: "F26207", category: "Developer", logo: LOGOS["replit"] },
  { name: "Bolt", slug: "", color: "1389FD", category: "Developer", logo: LOGOS["bolt"] },
  { name: "Supabase Pro", slug: "supabase", color: "3FCF8E", category: "Developer", logo: LOGOS["supabase-pro"] },
  { name: "N8N", slug: "n8n", color: "EA4B71", category: "Developer", logo: LOGOS["n8n"] },
  { name: "Coderabbit", slug: "coderabbit", color: "F97316", category: "Developer" },
  { name: "Firecrawl", slug: "firecrawl", color: "F97316", category: "Developer", logo: LOGOS["firecrawl"] },
  { name: "Figma Professional", slug: "figma", color: "F24E1E", category: "Creative", logo: LOGOS["figma"] },

  // DESIGN & CREATIVE TOOLS
  { name: "Adobe Creative Cloud", slug: "adobecreativecloud", color: "DA1F26", category: "Creative", logo: LOGOS["adobe-cc"] },
  { name: "Canva Pro/Business", slug: "canva", color: "00C4CC", category: "Creative", logo: LOGOS["canva-pro"] },
  { name: "Envato Elements", slug: "envato", color: "82B541", category: "Creative", logo: LOGOS["elements"] },
  { name: "Descript", slug: "descript", color: "1B1A1F", category: "Creative", logo: LOGOS["descript"] },
  { name: "Gamma Pro", slug: "gamma", color: "8B5CF6", category: "Productivity", logo: LOGOS["gamma-pro"] },

  // PLATFORM CREDITS
  { name: "AWS Credits", slug: "amazonwebservices", color: "FF9900", category: "Credits", logo: LOGOS["aws-credits"] },
  { name: "Claude Credits", slug: "anthropic", color: "D97757", category: "Credits", logo: LOGOS["marquee-claude-credits"] },
  { name: "Lovable Credits", slug: "", color: "FF4D8D", category: "Credits", logo: LOGOS["lovable-pro"] },
  { name: "Apify Credits", slug: "apify", color: "F86606", category: "Credits", logo: LOGOS["apify-credits"] },
  { name: "V0 Credits", slug: "vercel", color: "000000", category: "Credits", logo: LOGOS["marquee-v0-credits"] },
];

const T = (name: string): Tool =>
  TOP_DEMAND_TOOLS.find((t) => t.name === name) ?? TOP_DEMAND_TOOLS[0];

export const TOP_DEMAND_CATEGORIES: { title: string; tools: Tool[] }[] = [
  {
    title: "PROFESSIONAL TOOLS",
    tools: [
      T("LinkedIn Premium"),
      T("Microsoft Office"),
      T("Coursera Plus"),
      T("Rezi - Resume builder"),
      T("NordVPN"),
    ],
  },
  {
    title: "AI ASSISTANTS",
    tools: [
      T("ChatGPT Plus"),
      T("Claude AI"),
      T("Google Gemini"),
      T("Perplexity Pro"),
      T("Grok"),
      T("ElevenLabs"),
      T("Notion Business + AI"),
      T("Manus pro"),
      T("Fireflies Pro"),
      T("Wispr Flow"),
    ],
  },
  {
    title: "DEVELOPER TOOLS",
    tools: [
      T("Cursor Pro"),
      T("GitHub Copilot"),
      T("Lovable Pro & Lite"),
      T("Replit"),
      T("Bolt"),
      T("Supabase Pro"),
      T("N8N"),
      T("Coderabbit"),
      T("Firecrawl"),
      T("Figma Professional"),
    ],
  },
  {
    title: "DESIGN & CREATIVE TOOLS",
    tools: [
      T("Adobe Creative Cloud"),
      T("Canva Pro/Business"),
      T("Envato Elements"),
      T("Descript"),
      T("Gamma Pro"),
    ],
  },
  {
    title: "PLATFORM CREDITS",
    tools: [
      T("AWS Credits"),
      T("Claude Credits"),
      T("Lovable Credits"),
      T("Apify Credits"),
      T("V0 Credits"),
    ],
  },
];

// Marquee = subscriptions we offer that are NOT shown in the circular orbit.
// Keeps the homepage strip advertising additional tools beyond the orbit set.
export const MARQUEE_TOOLS: Tool[] = [
  { name: "Manus Pro", slug: "manus", color: "111827", category: "AI", domain: "manus.im", logo: marqueeLogo("Manus Pro") },
  { name: "Mobbin Team", slug: "mobbin", color: "111827", category: "Creative", domain: "mobbin.com", logo: marqueeLogo("Mobbin Team") },
  { name: "CodeRabbit Pro", slug: "coderabbit", color: "F97316", category: "Developer", domain: "coderabbit.ai", logo: marqueeLogo("CodeRabbit Pro") },
  { name: "Descript", slug: "descript", color: "1B1A1F", category: "Creative", domain: "descript.com", logo: marqueeLogo("Descript") },
  { name: "CapCut Pro", slug: "capcut", color: "000000", category: "Creative", domain: "capcut.com", logo: marqueeLogo("CapCut Pro") },
  { name: "Higgsfield", slug: "higgsfield", color: "111827", category: "AI", domain: "higgsfield.ai", logo: marqueeLogo("Higgsfield") },
  { name: "Canva Business", slug: "canva", color: "00C4CC", category: "Creative", domain: "canva.com", logo: marqueeLogo("Canva Business") },
  { name: "Leonardo AI", slug: "leonardoai", color: "8B5CF6", category: "AI", domain: "leonardo.ai", logo: marqueeLogo("Leonardo AI") },
  { name: "Fireflies Pro", slug: "fireflies", color: "F59E0B", category: "Productivity", domain: "fireflies.ai", logo: marqueeLogo("Fireflies Pro") },
  { name: "Lightfield CRM", slug: "lightfield", color: "6366F1", category: "Marketing", domain: "lightfieldcrm.com", logo: marqueeLogo("Lightfield CRM") },
  { name: "Indy", slug: "indy", color: "EC4899", category: "Productivity", domain: "weareindy.com", logo: marqueeLogo("Indy") },
  { name: "Lead.CM", slug: "leadcm", color: "0EA5E9", category: "Marketing", domain: "lead.cm", logo: marqueeLogo("Lead.CM") },
  { name: "Rezi", slug: "rezi", color: "1F2937", category: "Professional", domain: "rezi.ai", logo: marqueeLogo("Rezi") },
  { name: "Railway", slug: "railway", color: "0B0D0E", category: "Developer", domain: "railway.app", logo: marqueeLogo("Railway") },
  { name: "Framer Pro", slug: "framer", color: "0055FF", category: "Creative", domain: "framer.com", logo: marqueeLogo("Framer Pro") },
  { name: "Factory", slug: "factory", color: "111827", category: "Developer", domain: "factory.ai", logo: marqueeLogo("Factory") },
  { name: "ChatPRD", slug: "chatprd", color: "6366F1", category: "Productivity", domain: "chatprd.ai", logo: marqueeLogo("ChatPRD") },
  { name: "PostHog", slug: "posthog", color: "F54E00", category: "Developer", domain: "posthog.com", logo: marqueeLogo("PostHog") },
  { name: "Warpbuild", slug: "warp", color: "01A4FF", category: "Developer", domain: "warpbuild.com", logo: marqueeLogo("Warpbuild") },
  { name: "Granola", slug: "granola", color: "F59E0B", category: "Productivity", domain: "granola.ai", logo: marqueeLogo("Granola") },
  { name: "MagicPattern", slug: "magicpattern", color: "8B5CF6", category: "Creative", domain: "magicpattern.design", logo: marqueeLogo("MagicPattern") },
  { name: "Gumloop", slug: "gumloop", color: "EC4899", category: "AI", domain: "gumloop.com", logo: marqueeLogo("Gumloop") },
  { name: "Intercom", slug: "intercom", color: "1F8DED", category: "Marketing", domain: "intercom.com", logo: marqueeLogo("Intercom") },
  { name: "Linear", slug: "linear", color: "5E6AD2", category: "Productivity", domain: "linear.app", logo: marqueeLogo("Linear") },
  { name: "Loom", slug: "loom", color: "625DF5", category: "Productivity", domain: "loom.com", logo: marqueeLogo("Loom") },
  { name: "Filmora", slug: "wondersharefilmora", color: "08D5FB", category: "Creative", domain: "filmora.wondershare.com", logo: marqueeLogo("Filmora") },
  { name: "Asana", slug: "asana", color: "F06A6A", category: "Productivity", domain: "asana.com", logo: marqueeLogo("Asana") },
  { name: "Pngtree", slug: "pngtree", color: "F97316", category: "Creative", domain: "pngtree.com", logo: marqueeLogo("Pngtree") },
  { name: "Make.com", slug: "make", color: "6D00CC", category: "Developer", domain: "make.com", logo: marqueeLogo("Make.com") },
  { name: "Customer.io", slug: "customerio", color: "7C3AED", category: "Marketing", domain: "customer.io", logo: marqueeLogo("Customer.io") },
  { name: "Raycast", slug: "raycast", color: "FF6363", category: "Productivity", domain: "raycast.com", logo: marqueeLogo("Raycast") },
  { name: "Textshift", slug: "textshift", color: "0EA5E9", category: "AI", domain: "textshift.ai", logo: marqueeLogo("Textshift") },
  { name: "Miro Starter", slug: "miro", color: "FFD02F", category: "Productivity", domain: "miro.com", logo: marqueeLogo("Miro Starter") },
  { name: "Speechify", slug: "speechify", color: "F8485E", category: "AI", domain: "speechify.com", logo: marqueeLogo("Speechify") },
  { name: "Feature.fm", slug: "featurefm", color: "0EA5E9", category: "Marketing", domain: "feature.fm", logo: marqueeLogo("Feature.fm") },
  { name: "Guidless Pro", slug: "guidless", color: "111827", category: "Productivity", domain: "guidless.com", logo: marqueeLogo("Guidless Pro") },
  { name: "Freepik", slug: "freepik", color: "1273EB", category: "Creative", domain: "freepik.com", logo: marqueeLogo("Freepik") },
  { name: "Otter.ai", slug: "otter", color: "6A11C2", category: "AI", domain: "otter.ai", logo: marqueeLogo("Otter.ai") },
  { name: "Firecrawl", slug: "firecrawl", color: "F97316", category: "Developer", domain: "firecrawl.dev", logo: marqueeLogo("Firecrawl") },
  { name: "Autodesk", slug: "autodesk", color: "0696D7", category: "Professional", domain: "autodesk.com", logo: marqueeLogo("Autodesk") },
  { name: "edX Teams", slug: "edx", color: "02262B", category: "Professional", domain: "edx.org", logo: marqueeLogo("edX Teams") },
  { name: "Zee5", slug: "zee5", color: "8230C2", category: "Creative", domain: "zee5.com", logo: marqueeLogo("Zee5") },
  { name: "Sony LIV", slug: "sonyliv", color: "E50914", category: "Creative", domain: "sonyliv.com", logo: marqueeLogo("Sony LIV") },
  { name: "Disney+ Hotstar", slug: "hotstar", color: "0F1B45", category: "Creative", domain: "hotstar.com", logo: marqueeLogo("Disney Plus") },
  { name: "YouTube Premium", slug: "youtube", color: "FF0000", category: "Creative", domain: "youtube.com", logo: marqueeLogo("YouTube Premium") },
  { name: "Prime Video", slug: "primevideo", color: "00A8E1", category: "Creative", domain: "primevideo.com", logo: marqueeLogo("Prime Video") },
  { name: "Airtable", slug: "airtable", color: "18BFFF", category: "Productivity", domain: "airtable.com", logo: marqueeLogo("Airtable") },
  { name: "Hootsuite", slug: "hootsuite", color: "143059", category: "Marketing", domain: "hootsuite.com", logo: marqueeLogo("Hootsuite") },
  // Credits
  { name: "Airtable Credits", slug: "airtable", color: "18BFFF", category: "Credits", domain: "airtable.com", logo: marqueeLogo("Airtable Credits") },
  { name: "Claude Credits", slug: "anthropic", color: "D97757", category: "Credits", domain: "anthropic.com", logo: marqueeLogo("Claude Credits") },
  { name: "OpenAI Credits", slug: "openai", color: "10A37F", category: "Credits", domain: "openai.com", logo: marqueeLogo("OpenAI Credits") },
  { name: "Render Credits", slug: "render", color: "46E3B7", category: "Credits", domain: "render.com", logo: marqueeLogo("Render Credits") },
  { name: "v0 Credits", slug: "vercel", color: "000000", category: "Credits", domain: "v0.dev", logo: marqueeLogo("v0 Credits") },
  { name: "MongoDB Credits", slug: "mongodb", color: "47A248", category: "Credits", domain: "mongodb.com", logo: marqueeLogo("MongoDB Credits") },
  { name: "Scalingo Credits", slug: "scalingo", color: "1252EE", category: "Credits", domain: "scalingo.com", logo: marqueeLogo("Scalingo Credits") },
  { name: "Manus Credits", slug: "manus", color: "111827", category: "Credits", domain: "manus.im", logo: marqueeLogo("Manus Credits") },
  { name: "Vapi Credits", slug: "vapi", color: "10B981", category: "Credits", domain: "vapi.ai", logo: marqueeLogo("Vapi Credits") },
];

const RAW_ALL_TOOLS: Tool[] = [
  // DEVELOPER TOOLS
  { name: "Cursor Pro", slug: "cursor", color: "000000", category: "Developer" },
  { name: "GitHub Copilot", slug: "githubcopilot", color: "24292e", category: "Developer" },
  { name: "Lovable Pro / Lite", slug: "", color: "FF4D8D", category: "Developer", domain: "lovable.dev" },
  { name: "Replit", slug: "replit", color: "F26207", category: "Developer" },
  { name: "Bolt", slug: "", color: "1389FD", category: "Developer", domain: "bolt.new" },
  { name: "Supabase Pro", slug: "supabase", color: "3FCF8E", category: "Developer" },
  { name: "N8N", slug: "n8n", color: "EA4B71", category: "Developer" },
  { name: "Coderabbit", slug: "coderabbit", color: "F97316", category: "Developer" },
  { name: "Firecrawl", slug: "firecrawl", color: "F97316", category: "Developer" },
  { name: "Railway", slug: "railway", color: "0B0D0E", category: "Developer" },
  { name: "Warpbuild", slug: "", color: "01A4FF", category: "Developer", domain: "warpbuild.com" },
  { name: "Factory", slug: "", color: "111827", category: "Developer", domain: "factory.ai" },

  // DESIGN & CREATIVE TOOLS
  { name: "Adobe Creative Cloud", slug: "adobecreativecloud", color: "DA1F26", category: "Creative" },
  { name: "Canva Pro", slug: "canva", color: "00C4CC", category: "Creative" },
  { name: "Figma", slug: "figma", color: "F24E1E", category: "Creative" },
  { name: "Canva Business + Leonardo AI", slug: "canva", color: "00C4CC", category: "Creative" },
  { name: "Envato Elements", slug: "envato", color: "82B541", category: "Creative" },
  { name: "CapCut", slug: "capcut", color: "000000", category: "Creative" },
  { name: "InVideo", slug: "invideo", color: "FF3E5B", category: "Creative" },
  { name: "Gamma", slug: "gamma", color: "8B5CF6", category: "Creative" },
  { name: "Descript", slug: "descript", color: "1B1A1F", category: "Creative" },
  { name: "Filmora", slug: "wondersharefilmora", color: "08D5FB", category: "Creative" },
  { name: "Freepik", slug: "freepik", color: "1273EB", category: "Creative" },
  { name: "Autodesk", slug: "autodesk", color: "0696D7", category: "Creative" },
  { name: "PNGTree", slug: "", color: "F97316", category: "Creative", domain: "pngtree.com" },
  { name: "Higgsfield", slug: "", color: "111827", category: "Creative", domain: "higgsfield.ai" },

  // PRODUCT, MARKETING & GROWTH
  { name: "Mobbin Team", slug: "mobbin", color: "111827", category: "Product/Marketing" },
  { name: "Framer pro", slug: "framer", color: "0055FF", category: "Product/Marketing" },
  { name: "Intercom", slug: "intercom", color: "1F8DED", category: "Product/Marketing" },
  { name: "Linear", slug: "linear", color: "5E6AD2", category: "Product/Marketing" },
  { name: "Loom", slug: "loom", color: "625DF5", category: "Product/Marketing" },
  { name: "Make.com", slug: "make", color: "6D00CC", category: "Product/Marketing" },
  { name: "MagicPattern", slug: "", color: "8B5CF6", category: "Product/Marketing", domain: "magicpattern.design" },
  { name: "PostHog", slug: "posthog", color: "F54E00", category: "Product/Marketing" },
  { name: "Customer.io", slug: "customerio", color: "7C3AED", category: "Product/Marketing" },
  { name: "Hootsuite", slug: "hootsuite", color: "143059", category: "Product/Marketing" },
  { name: "ChatPRD", slug: "", color: "6366F1", category: "Product/Marketing", domain: "chatprd.ai" },
  { name: "Miro Starter", slug: "miro", color: "FFD02F", category: "Product/Marketing" },
  { name: "Feature.fm", slug: "", color: "0EA5E9", category: "Product/Marketing", domain: "feature.fm" },
  { name: "Guidless Pro", slug: "", color: "111827", category: "Product/Marketing", domain: "guidless.com" },

  // BUSINESS & OPERATIONS
  { name: "Airtable", slug: "airtable", color: "18BFFF", category: "Business/Operations" },
  { name: "Asana", slug: "asana", color: "F06A6A", category: "Business/Operations" },
  { name: "Lead.CM", slug: "", color: "0EA5E9", category: "Business/Operations", domain: "lead.cm" },
  { name: "Gumloop", slug: "", color: "EC4899", category: "Business/Operations", domain: "gumloop.com" },
  { name: "TextShift", slug: "", color: "0EA5E9", category: "Business/Operations", domain: "textshift.ai" },
  { name: "Lightfield CRM", slug: "", color: "6366F1", category: "Business/Operations", domain: "lightfieldcrm.com" },
  { name: "Indy", slug: "", color: "EC4899", category: "Business/Operations", domain: "weareindy.com" },
  { name: "Raycast", slug: "raycast", color: "FF6363", category: "Business/Operations" },

  // OTT PLATFORMS
  { name: "YouTube Premium", slug: "youtube", color: "FF0000", category: "OTT" },
  { name: "Amazon Prime Video", slug: "primevideo", color: "00A8E1", category: "OTT" },
  { name: "JioHotstar", slug: "hotstar", color: "0F1B45", category: "OTT" },
  { name: "SonyLIV", slug: "sonyliv", color: "E50914", category: "OTT" },
  { name: "ZEE 5", slug: "zee5", color: "8230C2", category: "OTT" },
  { name: "Spotify", slug: "spotify", color: "1DB954", category: "OTT" },

  // PLATFORM CREDITS
  { name: "OpenAI Credits", slug: "openai", color: "10A37F", category: "Credits", logo: LOGOS["marquee-openai-credits"] },
  { name: "AWS Credits", slug: "amazonwebservices", color: "FF9900", category: "Credits", logo: LOGOS["aws-credits"] },
  { name: "Claude Credits", slug: "anthropic", color: "D97757", category: "Credits", logo: LOGOS["marquee-claude-credits"] },
  { name: "Lovable Credits", slug: "", color: "FF4D8D", category: "Credits", domain: "lovable.dev", logo: LOGOS["lovable-pro"] },
  { name: "Apify Credits", slug: "apify", color: "F86606", category: "Credits", logo: LOGOS["apify-credits"] },
  { name: "V0 Credits", slug: "vercel", color: "000000", category: "Credits", logo: LOGOS["marquee-v0-credits"] },
  { name: "Firecrawl Credits", slug: "firecrawl", color: "F97316", category: "Credits" },
  { name: "MongoDB Credits", slug: "mongodb", color: "47A248", category: "Credits", logo: LOGOS["marquee-mongodb-credits"] },
  { name: "Vapi Credits", slug: "", color: "10B981", category: "Credits", domain: "vapi.ai", logo: LOGOS["marquee-vapi-credits"] },
  { name: "Airtable Credits", slug: "airtable", color: "18BFFF", category: "Credits", logo: LOGOS["marquee-airtable-credits"] },
  { name: "Render Credits", slug: "render", color: "46E3B7", category: "Credits", logo: LOGOS["marquee-render-credits"] },
  { name: "Scalingo Credits", slug: "scalingo", color: "1252EE", category: "Credits", logo: LOGOS["marquee-scalingo-credits"] },
];

export const ALL_TOOLS: Tool[] = Array.from(
  new Map(RAW_ALL_TOOLS.map(t => [`${t.name}-${t.category}`, t])).values()
);

export const logoUrl = (tool: Tool) =>
  `https://cdn.simpleicons.org/${tool.slug}/${tool.color ?? "0A66C2"}`;

