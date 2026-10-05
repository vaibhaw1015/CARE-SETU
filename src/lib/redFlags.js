/**
 * redFlags.js
 * Layer-1 instant red-flag scanner.
 * Runs client-side BEFORE any LLM API call.
 *
 * Returns a RedFlag object if the message contains dangerous symptom keywords,
 * or null if the message is safe to process normally.
 */

/** @typedef {{ isRedFlag: true, category: string, headline: string, advice: string }} RedFlag */

const RED_FLAG_PATTERNS = [
  // ── Cardiac ──────────────────────────────────────────────────────────────────
  {
    category: "Possible Heart Attack",
    keywords: [
      "chest pain", "chest pressure", "chest tightness", "chest discomfort",
      "heart attack", "heart pain", "crushing chest", "left arm pain",
      "left arm numb", "jaw pain", "heart is pounding", "heart stopping",
      "seene mein dard",  // Hindi: chest pain
    ],
    advice: "Chew an aspirin (if not allergic), sit down, and call 108 immediately. Do not drive yourself.",
  },

  // ── Stroke ───────────────────────────────────────────────────────────────────
  {
    category: "Possible Stroke",
    keywords: [
      "face drooping", "face numb", "sudden numbness", "arm weakness",
      "slurred speech", "can't speak", "cannot speak", "sudden confusion",
      "sudden vision loss", "sudden severe headache", "FAST stroke",
      "paralysis", "half body numb", "body paralysis",
    ],
    advice: "Note the time symptoms started. Do NOT give food or water. Call 108 immediately — time is critical for stroke.",
  },

  // ── Breathing ────────────────────────────────────────────────────────────────
  {
    category: "Breathing Emergency",
    keywords: [
      "can't breathe", "cannot breathe", "difficulty breathing",
      "trouble breathing", "gasping", "choking", "blue lips", "lips are blue",
      "no air", "suffocating", "suffocation", "breathless",
      "saans nahi aa rahi", // Hindi: can't breathe
    ],
    advice: "Keep the person sitting upright. Loosen tight clothing. Call 108 immediately — do not wait.",
  },

  // ── Unconscious / Unresponsive ────────────────────────────────────────────────
  {
    category: "Unconscious / Unresponsive",
    keywords: [
      "unconscious", "unresponsive", "not responding", "passed out",
      "fainted", "not waking up", "won't wake", "coma",
      "behosh", // Hindi: unconscious
    ],
    advice: "Place in recovery position (on their side). Do not give food or water. Call 108 now.",
  },

  // ── Seizure ───────────────────────────────────────────────────────────────────
  {
    category: "Seizure / Convulsion",
    keywords: [
      "seizure", "convulsion", "convulsing", "fitting", "epilepsy attack",
      "shaking uncontrollably", "body shaking", "fits", "dora",
    ],
    advice: "Clear the area around them, cushion their head, do NOT restrain them. Call 108.",
  },

  // ── Severe Bleeding ───────────────────────────────────────────────────────────
  {
    category: "Severe Bleeding",
    keywords: [
      "heavy bleeding", "won't stop bleeding", "blood won't stop",
      "spurting blood", "major blood loss", "bleeding heavily",
      "bahut khoon", // Hindi: a lot of blood
    ],
    advice: "Apply firm pressure with a clean cloth. Do NOT remove the cloth. Elevate the injured area. Call 108.",
  },

  // ── Poisoning / Overdose ──────────────────────────────────────────────────────
  {
    category: "Poisoning / Overdose",
    keywords: [
      "swallowed poison", "drank poison", "ate poison", "overdose",
      "drug overdose", "took too many pills", "accidental overdose",
      "insecticide", "pesticide ingestion", "chemical ingestion",
    ],
    advice: "Do NOT induce vomiting unless instructed. Call 108 or Poison Control. Note what was ingested.",
  },

  // ── Pediatric Emergency ───────────────────────────────────────────────────────
  {
    category: "Child Emergency",
    keywords: [
      "baby not breathing", "infant not breathing", "child unconscious",
      "baby unconscious", "newborn not breathing", "baby choking",
      "child seizure", "baby fit", "baccha behosh", // Hindi: child unconscious
    ],
    advice: "Call 108 immediately. Keep the child warm. Do NOT shake a baby. If not breathing, start CPR if trained.",
  },

  // ── Severe Allergic Reaction ──────────────────────────────────────────────────
  {
    category: "Severe Allergic Reaction (Anaphylaxis)",
    keywords: [
      "anaphylaxis", "anaphylactic", "throat closing", "throat swelling",
      "tongue swelling", "lips swelling", "severe allergy",
      "epipen", "allergic shock",
    ],
    advice: "Use an EpiPen if available. Lay them flat with legs raised. Call 108 — anaphylaxis is life-threatening.",
  },
];

/**
 * Scans a user message for medical red-flag keywords.
 *
 * @param {string} text - The user's raw input message
 * @returns {RedFlag | null} - A RedFlag object if dangerous, null if safe
 */
export function detectRedFlag(text) {
  if (!text || typeof text !== "string") return null;

  const lower = text.toLowerCase();

  for (const pattern of RED_FLAG_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return {
          isRedFlag: true,
          category: pattern.category,
          headline: `⚠️ ${pattern.category} Detected`,
          advice: pattern.advice,
        };
      }
    }
  }

  return null;
}

/**
 * Returns true if the text contains any red-flag keyword.
 * Cheaper check when you only need a boolean.
 */
export function hasRedFlag(text) {
  return detectRedFlag(text) !== null;
}
