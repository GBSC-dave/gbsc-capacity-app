// Fall 2026 — Capacity Move cards (client-facing)
// Source: GBSC Fall 2026 Capacity Method — Dave Handoff Source of Truth v4 Final, Section 10.
// Member normally sees only their one active card. Diagnostic/matching logic stays coach-side (not in this file).
// Dose is coach-confirmed: "anchor" | "builder" | "expansion".

export const FALL_CAPACITY_MOVES = {
  M1: {
    id: "M1",
    title: "Protect Your Training",
    thisMightBeYourMoveIf:
      "You want to train consistently, but workouts keep getting squeezed out by work, family, or a changing schedule.",
    whyItsPowerful:
      "Training is much more likely to happen when it has a place in your week before the week gets busy.",
    doses: {
      anchor: "Schedule and complete 2 training sessions this week.",
      builder: "Schedule and complete 3 training sessions this week.",
      expansion: "Hit Builder and add appropriate conditioning, movement, or another training opportunity when your week supports it.",
    },
    makeItEasier: "Schedule before the week begins. Choose one backup time for your most vulnerable session.",
    watchFor: "Missing one workout and deciding the week is blown.",
  },
  M2: {
    id: "M2",
    title: "Build the Movement Floor",
    thisMightBeYourMoveIf: "You exercise, but much of the rest of your day is spent sitting or barely moving.",
    whyItsPowerful:
      "Your workouts matter enormously, but your body also responds to the other hours of your week.",
    doses: {
      anchor: "One intentional 10-minute walk each day.",
      builder: "Accumulate roughly 30 minutes of additional easy movement most days.",
      expansion: "Build toward a consistently active day that fits your lifestyle.",
    },
    makeItEasier: "Attach movement to meals, calls, practices, commute, or family time.",
    watchFor: "Thinking \"it's only walking.\" Easy movement counts.",
  },
  M3: {
    id: "M3",
    title: "Anchor Your Meals",
    thisMightBeYourMoveIf: "Your eating doesn't need a complicated diet — it needs more reliable structure.",
    whyItsPowerful:
      "A few solid meals can make energy, hunger, protein, fiber and overall nutrition easier to manage.",
    doses: {
      anchor: "Build one meal every day around protein + a high-fiber real food.",
      builder: "Build 2–3 meals/day around protein + fiber.",
      expansion: "Create consistent meal structure while increasing useful variety.",
    },
    makeItEasier: "Use a small list of repeatable meals; start with the easiest meal.",
    watchFor: "Turning this into a perfect diet.",
  },
  M4: {
    id: "M4",
    title: "Build the Food Backup",
    thisMightBeYourMoveIf:
      "You generally know how you'd like to eat, but when life gets busy, whatever is easiest wins.",
    whyItsPowerful: "Hungry + busy + no plan is a tough combination. We need a better default, not more willpower.",
    doses: {
      anchor: "Have one reliable backup meal or snack available every workday.",
      builder: "Have convenient, useful food available for most situations that derail you.",
      expansion: "Create reliable food backups at home, work, and on the go.",
    },
    makeItEasier: "Prepared, frozen, and purchased food all count.",
    watchFor: "Believing good nutrition requires elaborate meal prep.",
  },
  M5: {
    id: "M5",
    title: "Protect the Off-Ramp",
    thisMightBeYourMoveIf:
      "You know you should go to bed earlier, but nighttime feels like the only part of the day that belongs to you.",
    whyItsPowerful:
      "We are not taking away downtime; we are protecting it without repeatedly borrowing from tomorrow.",
    doses: {
      anchor: "Start your downshift 15 minutes earlier on two nights.",
      builder: "Create an intentional earlier off-ramp four nights/week.",
      expansion: "Build a consistent, enjoyable evening rhythm that protects downtime and sleep.",
    },
    makeItEasier: "Keep something you enjoy: reading, music, shower, conversation, stretching, quiet time.",
    watchFor: "Making your evening routine another list of chores.",
  },
  M6: {
    id: "M6",
    title: "Protect Sleep Opportunity",
    thisMightBeYourMoveIf: "You're simply not giving yourself enough opportunity to sleep.",
    whyItsPowerful: "Before optimizing sleep, we need enough time available for it to happen.",
    doses: {
      anchor: "Create about 15 additional minutes of sleep opportunity on 2–3 nights.",
      builder: "Protect a sufficient sleep window on most nights.",
      expansion: "Build consistent sleep/wake timing and a sleep-supportive environment.",
    },
    makeItEasier: "Start with wake time and work backward.",
    watchFor: "Chasing sleep hacks while consistently spending too little time in bed.",
  },
  M7: {
    id: "M7",
    title: "Build a Real Downshift",
    thisMightBeYourMoveIf:
      "You spend much of your life in go mode and don't have a reliable way to switch out of it.",
    whyItsPowerful:
      "Recovery is not only stopping work; your body and brain sometimes need a clear signal that doing is done.",
    doses: {
      anchor: "10 minutes of intentional downshift 3×/week.",
      builder: "Use an enjoyable downshift on most high-stress days.",
      expansion: "Build several ways to change gears depending on what you need.",
    },
    makeItEasier: "Choose something that genuinely feels good: walk, music, sauna, read, breathe, talk, outside, shower, play.",
    watchFor: "Choosing what sounds healthy instead of something you actually enjoy.",
  },
  M8: {
    id: "M8",
    title: "Protect the Weekend",
    thisMightBeYourMoveIf: "Monday through Friday usually goes well, but weekends feel like starting over.",
    whyItsPowerful:
      "Your weekend does not need to look like a weekday; it needs enough structure to stay connected to what matters.",
    doses: {
      anchor: "Protect one important behavior all weekend.",
      builder: "Choose two weekend guardrails before Friday.",
      expansion: "Build weekends that are enjoyable and support the person you are becoming.",
    },
    makeItEasier: "Possible guardrails: workout, walk, breakfast, protein, bedtime, alcohol boundary.",
    watchFor: "Trying to make Saturday perfect.",
  },
  M9: {
    id: "M9",
    title: "Win the Minimum Week",
    thisMightBeYourMoveIf: "You're great when life goes according to plan, but struggle when it doesn't.",
    whyItsPowerful: "Difficult weeks do not need to be your best weeks. They just do not need to become zero weeks.",
    doses: {
      anchor: "Define the minimum week that survives one of your worst realistic weeks.",
      builder: "Return to your normal weekly targets.",
      expansion: "Build beyond them when life genuinely allows.",
    },
    makeItEasier: "Decide the minimum before the week gets difficult.",
    watchFor: "Thinking the minimum is not enough to matter.",
  },
  M10: {
    id: "M10",
    title: "Change the Environment",
    thisMightBeYourMoveIf: "You repeatedly have to fight your surroundings to make the choice you want.",
    whyItsPowerful: "The easier choice wins surprisingly often, so make the choice you want easier.",
    doses: {
      anchor: "Change one important cue or default.",
      builder: "Redesign the environment where your biggest problem repeatedly occurs.",
      expansion: "Create supportive defaults across home, work and travel.",
    },
    makeItEasier: "Phone outside bedroom, bag ready, useful food visible, backup meals, sessions booked, shoes available.",
    watchFor: "Trying to fix motivation while leaving the same obstacle in place.",
  },
  M11: {
    id: "M11",
    title: "Create Margin",
    thisMightBeYourMoveIf: "The problem is not laziness or motivation. There is simply very little room left.",
    whyItsPowerful:
      "You cannot endlessly optimize an overloaded life. Sometimes the highest-leverage Move is creating space.",
    doses: {
      anchor: "Protect one 30-minute block this week with no obligation attached.",
      builder: "Remove, shorten, delegate or delay one recurring demand and protect regular margin.",
      expansion: "Build enough breathing room that health, recovery and people who matter do not constantly compete for what is left.",
    },
    makeItEasier: "Protect the space before something else fills it.",
    watchFor: "Immediately filling the margin you create.",
  },
  M12: {
    id: "M12",
    title: "Build Support",
    thisMightBeYourMoveIf:
      "You know what would help and want to do it, but it is much harder when you are doing it alone.",
    whyItsPowerful: "Support makes important behaviors visible, and visible behaviors are easier to protect.",
    doses: {
      anchor: "Tell one person exactly what you're working on this week.",
      builder: "Create a specific support/accountability arrangement.",
      expansion: "Build an environment where the behaviors you value are naturally supported.",
    },
    makeItEasier: "Define behavior + person + when they check + what happens next.",
    watchFor: "Vague accountability.",
  },
};

export const FALL_MOVE_IDS = Object.keys(FALL_CAPACITY_MOVES);

// "YOUR REASON" — identical prompt template across all 12 cards, filled with the member's Q2 answer.
export const MOVE_REASON_TEMPLATE = "I'm working on this because I want my health to make __________ possible.";

export function getMoveCard(moveId, dose) {
  const move = FALL_CAPACITY_MOVES[moveId];
  if (!move) return null;
  return {
    id: move.id,
    title: move.title,
    thisMightBeYourMoveIf: move.thisMightBeYourMoveIf,
    whyItsPowerful: move.whyItsPowerful,
    activeDoseText: move.doses[dose] || null,
    makeItEasier: move.makeItEasier,
    watchFor: move.watchFor,
    reasonTemplate: MOVE_REASON_TEMPLATE,
  };
}
