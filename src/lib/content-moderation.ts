/**
 * Server-side text moderation: violence, sexual content, drug trade/abuse,
 * ethnic/national hate, personal threats. Optional OpenAI Moderation API.
 *
 * Binary image/video is not analysed (needs Vision/NSFW service). Captions and
 * all text fields are checked.
 */

export type ModerationReason =
  | "violence"
  | "sexual"
  | "drugs"
  | "hate"
  | "threats"
  | "external";

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: ModerationReason };

function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, "")
    .replace(/[`*_~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match whole token (Cyrillic/Latin letters + digits as word) */
function hasToken(haystack: string, word: string): boolean {
  const re = new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^\\p{L}\\p{N}])`,
    "iu",
  );
  return re.test(haystack);
}

const VIOLENCE_TOKENS = [
  "заріжу",
  "зарезу",
  "розстріляю",
  "розірву",
  "підірву",
  "терорист",
  "тероризм",
  "torture",
  "lynch",
  "decapit",
];

const VIOLENCE_PHRASES = [
  "kill you",
  "kill him",
  "kill her",
  "kill them",
  "murder you",
  "murder him",
  "i will kill",
  "i will hurt",
  "i will shoot",
  "shoot you",
  "mass shooting",
  "вб'ю тебе",
  "вбию тебе",
  "убью тебя",
  "убей тебя",
  "я тебе вб",
  "я тебя уб",
  "знищу тебе",
  "бомбу в",
  "кровопролиття",
];

const VIOLENCE_RE =
  /(genocide|massacre|ethnic cleansing|school shooting|pipe bomb|make a bomb)/i;

const SEXUAL_PHRASES = [
  "child porn",
  "childporn",
  "child sex",
  "дитячий секс",
  "інцест",
  "зоофіл",
  "порнографія",
  "revenge porn",
  "rape video",
  "cp link",
  "onlyfans leak",
];

const SEXUAL_TOKENS = ["порно", "педофіл", "порнограф"];

const DRUG_PHRASES = [
  "куплю наркот",
  "продам наркот",
  "куплю кокаїн",
  "продам кокаїн",
  "куплю кокаин",
  "продам кокаин",
  "мефедрон",
  "darknet market",
  "buy meth",
  "sell meth",
  "buy cocaine",
  "sell cocaine",
  "buy heroin",
  "sell heroin",
  "sell fentanyl",
  "амфетамін продам",
  "героін куп",
  "ширка продам",
];

const DRUG_RE = /(?:buy|sell)\s+(meth|cocaine|heroin|fentanyl|mdma)\b/i;

const HATE_PHRASES = [
  "смерть москал",
  "смерть хохл",
  "смерть жид",
  "смерть чурк",
  "смерть негр",
  "gas the jews",
  "race war",
  "ethnic cleansing",
];

const HATE_RE =
  /(?:^|[^\p{L}\p{N}])(?:москал(?:я|і|ь)|хохол.*смерть|жид(?:и|ів)\s+геть)(?:$|[^\p{L}\p{N}])/iu;

const THREAT_PHRASES = [
  "знайду тебе",
  "найду тебя",
  "you will regret",
  "watch your back",
  "i know where you live",
  "swatting",
  "розправлюсь",
  "ти пожалієш",
];

const THREAT_RE =
  /(?:^|[^\p{L}\p{N}])(?:убью\s+тебя|зарежу|я\s+вас\s+всіх)(?:$|[^\p{L}\p{N}])/iu;

function matchLocal(normalized: string): ModerationReason | null {
  for (const p of VIOLENCE_PHRASES) {
    if (normalized.includes(p)) return "violence";
  }
  if (VIOLENCE_RE.test(normalized)) return "violence";
  for (const w of VIOLENCE_TOKENS) {
    if (hasToken(normalized, w)) return "violence";
  }

  for (const p of SEXUAL_PHRASES) {
    if (normalized.includes(p)) return "sexual";
  }
  for (const w of SEXUAL_TOKENS) {
    if (hasToken(normalized, w)) return "sexual";
  }

  for (const p of DRUG_PHRASES) {
    if (normalized.includes(p)) return "drugs";
  }
  if (DRUG_RE.test(normalized)) return "drugs";

  for (const p of HATE_PHRASES) {
    if (normalized.includes(p)) return "hate";
  }
  if (HATE_RE.test(normalized)) return "hate";

  for (const p of THREAT_PHRASES) {
    if (normalized.includes(p)) return "threats";
  }
  if (THREAT_RE.test(normalized)) return "threats";

  return null;
}

async function openAIModerate(text: string): Promise<ModerationResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) return { ok: true };

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 12_000);
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
      signal: ac.signal,
    });
    if (!res.ok) return { ok: true };
    const data = (await res.json()) as {
      results?: { flagged?: boolean }[];
    };
    if (data.results?.[0]?.flagged) {
      return { ok: false, reason: "external" };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  } finally {
    clearTimeout(t);
  }
}

export async function moderateUserText(text: string): Promise<ModerationResult> {
  const n = normalize(text);
  if (!n) return { ok: true };

  const local = matchLocal(n);
  if (local) return { ok: false, reason: local };

  return openAIModerate(text);
}

export async function moderateCombinedText(parts: string[]): Promise<ModerationResult> {
  return moderateUserText(parts.filter(Boolean).join("\n\n"));
}
