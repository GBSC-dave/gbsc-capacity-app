// Fall 2026 — Capacity Reflection data model
// Source: GBSC Fall 2026 Capacity Method — Dave Handoff Source of Truth v4 Final, Section 4 (copy) + Section 38 (exact Q5/Q6 branch IDs)
// Target: ~5 min typical, under 7 min hard ceiling. Q2 is the only required prose field — everything else is tap/select.

export const REFLECTION_OPENING =
  "Fall Capacity is about helping you build more than fitness. We want to understand what you want your health to make possible, what is most getting in the way right now, and the most useful Move we can realistically make.";

// Q1 — What do you want your health to make possible? (choose ONE)
export const Q1_OPTIONS = [
  { id: "more_energy", label: "Have more energy for my life" },
  { id: "stronger_capable", label: "Feel stronger and more physically capable" },
  { id: "confident_body", label: "Feel better and more confident in my body" },
  { id: "present_family", label: "Be more present and engaged with my family" },
  { id: "keep_up_kids", label: "Keep up with my kids or grandkids" },
  { id: "activities_hobbies", label: "Do activities, hobbies, or adventures I care about" },
  { id: "handle_stress", label: "Handle stressful or demanding periods better" },
  { id: "long_term_health", label: "Improve my long-term health" },
  { id: "myself_again", label: "Feel more like myself again" },
  { id: "physical_performance", label: "Improve my physical performance" },
  { id: "stay_independent", label: "Stay capable and independent as I get older" },
  { id: "other", label: "Something else" },
];

// Q2 — Make it real (the ONE required prose field in the whole Reflection)
export const Q2_PROMPT =
  "If my health and fitness improved over the next six months, I'd love to be able to __________ more easily, consistently, or confidently.";
export const Q2_EXAMPLES = [
  "play with my kids after work",
  "hike with my family",
  "have better afternoon energy",
  "feel good in my clothes",
  "handle busy weeks better",
  "run a 5K",
  "travel confidently",
  "work in the yard without getting wiped out",
  "say yes to more things",
];

// Q3 — Why does that matter? (choose up to TWO)
export const Q3_PROMPT = "That matters to me because I want to...";
export const Q3_OPTIONS = [
  { id: "energy_for_others", label: "Have more energy for people I care about" },
  { id: "proud_of_body", label: "Feel proud of what my body can do" },
  { id: "confident_in_myself", label: "Feel more confident in myself" },
  { id: "healthier_for_dependents", label: "Be healthier for people who depend on me" },
  { id: "worry_less", label: "Worry less about my health or future" },
  { id: "stay_independent", label: "Stay capable and independent as I get older" },
  { id: "say_yes_experiences", label: "Say yes to experiences I care about" },
  { id: "feel_like_myself", label: "Feel more like myself" },
  { id: "positive_example", label: "Be a positive example for my family" },
  { id: "enjoy_life_unlimited", label: "Enjoy life without feeling limited by my health" },
  { id: "personally_meaningful", label: "Accomplish something personally meaningful" },
  { id: "comfortable_in_body", label: "Feel more comfortable and confident in my body" },
  { id: "other", label: "Something else" },
];

// Q4 — Recognition before constraints (choose ONE — member's hypothesis, not the diagnosis)
export const Q4_PROMPT =
  "If you could improve ONE thing right now that you think would make a meaningful difference, what would it be?";
export const Q4_OPTIONS = [
  { id: "exercise_strength", label: "Exercise / strength" },
  { id: "movement_outside_gym", label: "Movement outside the gym" },
  { id: "nutrition", label: "Nutrition" },
  { id: "sleep", label: "Sleep" },
  { id: "stress_recovery", label: "Stress / recovery" },
  { id: "schedule_time", label: "Schedule / time" },
  { id: "weekends", label: "Weekends" },
  { id: "alcohol", label: "Alcohol" },
  { id: "hydration", label: "Hydration" },
  { id: "pain_free_movement", label: "Pain-free movement / physical limitations" },
  { id: "consistency", label: "Consistency / follow-through" },
  { id: "other", label: "Something else" },
];
// NOTE: Q4 is the member's hypothesis only. Hydration is not a 13th Capacity Move —
// the matching algorithm resolves to the underlying mechanism regardless of Q4.

// Q5 — What is most getting in the way? (choose ONE — these are the 13 "terrain" categories used to branch Q6)
export const Q5_OPTIONS = [
  { id: "training_consistency", label: "Training consistency" },
  { id: "daily_movement", label: "Daily movement" },
  { id: "meal_structure", label: "Meal structure / nutrition" },
  { id: "food_availability", label: "Food availability / convenience" },
  { id: "sleep", label: "Sleep" },
  { id: "stress_downshift", label: "Stress / downshift" },
  { id: "weekends", label: "Weekends" },
  { id: "all_or_nothing", label: "All-or-nothing / plan fragility" },
  { id: "environment", label: "Environment / defaults" },
  { id: "overload", label: "Overload / lack of margin" },
  { id: "support", label: "Support / accountability" },
  { id: "recovery_depletion", label: "Recovery / unexplained depletion" },
  { id: "physical", label: "Pain, injury, or physical limitation" },
  { id: "other", label: "Something else" },
];
// If "other": require one short field ("Briefly, what's getting in the way?"), then STOP auto-matching and flag coach review.

// Q6 — Mechanism (branches on Q5 terrain). Exact stable IDs per Section 38.
// Each terrain's option list ends with a generic "other" entry.
export const Q6_BRANCHES = {
  training_consistency: [
    { id: "not_scheduled", label: "I don't schedule workouts ahead of time" },
    { id: "work_changes", label: "Work regularly changes my plans" },
    { id: "family_changes", label: "Family responsibilities regularly change my plans" },
    { id: "wait_for_time", label: "I wait to see when I'll have time" },
    { id: "plan_fragile", label: "My plan works during normal weeks but falls apart when life gets busy, my schedule changes, or I travel" },
    { id: "one_miss", label: "If I miss one workout, I often lose momentum for the rest of the week" },
    { id: "physical_barrier", label: "Pain, injury, or another physical limitation makes training difficult", stopFlag: true },
    { id: "other", label: "Something else" },
  ],
  daily_movement: [
    { id: "sitting_job", label: "My job requires a lot of sitting" },
    { id: "driving", label: "I spend a lot of time driving" },
    { id: "busy_not_moving", label: "I'm busy all day but don't actually move very much" },
    { id: "no_intentional_movement", label: "I don't intentionally make time for walking or easy movement" },
    { id: "workout_is_enough", label: "I exercise and tend to assume that's enough movement for the day" },
    { id: "physical_barrier", label: "A physical issue, pain, or limitation makes more movement difficult", stopFlag: true },
    { id: "other", label: "Something else" },
  ],
  meal_structure: [
    { id: "irregular_skip", label: "My meals happen at inconsistent times or I frequently skip them" },
    { id: "low_structure", label: "I don't consistently build meals around protein and high-fiber foods" },
    { id: "late_hunger", label: "I get extremely hungry later in the day" },
    { id: "no_repeatables", label: "I don't have a few reliable meals I can repeat" },
    { id: "schedule_meals", label: "My schedule makes regular meals difficult" },
    { id: "not_sure_meal", label: "I'm not really sure what a simple, solid meal should look like" },
    { id: "other", label: "Something else" },
  ],
  food_availability: [
    { id: "not_available", label: "I don't have useful food available when I need it" },
    { id: "dont_want_prep", label: "I don't want to spend a lot of time meal prepping" },
    { id: "work_travel", label: "Work or travel forces me to eat on the go" },
    { id: "decide_hungry", label: "I wait until I'm very hungry before deciding what to eat" },
    { id: "convenience", label: "Takeout or convenience food becomes the easiest option" },
    { id: "dont_prepare_buy", label: "I have good intentions but don't prepare or buy what I need" },
    { id: "other", label: "Something else" },
  ],
  sleep: [
    { id: "too_little_opportunity", label: "I don't leave enough time for sleep" },
    { id: "personal_time", label: "Nighttime is the only time that feels like mine" },
    { id: "screens", label: "Screens keep me up later than intended" },
    { id: "work_tasks", label: "Work or unfinished tasks keep me up" },
    { id: "family_schedule", label: "Family responsibilities or my schedule interrupt my sleep" },
    { id: "sleep_maintenance", label: "I fall asleep fine, but wake too early or repeatedly during the night", stopFlag: true },
    { id: "unrefreshed", label: "I give myself enough time to sleep but still don't feel rested", stopFlag: true },
    { id: "other", label: "Something else" },
  ],
  stress_downshift: [
    { id: "go_mode", label: "I stay in work or problem-solving mode for most of the day" },
    { id: "no_decompress", label: "I don't have a reliable way to decompress" },
    { id: "no_personal_time", label: "I rarely create any time that's actually mine" },
    { id: "competing_relief", label: "Food, alcohol, screens, or another behavior have become one of my main ways to unwind" },
    { id: "know_but_dont", label: "I know things that help me relax but rarely actually do them" },
    { id: "life_too_full", label: "My life simply feels too full to recover well" },
    { id: "other", label: "Something else" },
  ],
  weekends: [
    { id: "alcohol", label: "Alcohol" },
    { id: "social_eating", label: "Restaurant or social eating" },
    { id: "sleep_schedule", label: "My sleep schedule" },
    { id: "training_movement", label: "Training or movement" },
    { id: "routines_disappear", label: "Most of my normal routines disappear" },
    { id: "social_pressure", label: "Social situations make my normal choices harder" },
    { id: "other", label: "Something else" },
  ],
  all_or_nothing: [
    { id: "full_workout_or_none", label: "If I can't do the full workout, I often do nothing" },
    { id: "one_bad_day", label: "One poor meal or day tends to become several" },
    { id: "small_not_worthwhile", label: "Small efforts don't feel worthwhile to me" },
    { id: "ambitious_unsustainable", label: "I repeatedly start ambitious plans that become difficult to sustain" },
    { id: "write_off_week", label: "When a week goes badly, I mentally write it off" },
    { id: "no_difficult_week_plan", label: "My normal plan works, but I don't have a good version for difficult weeks" },
    { id: "other", label: "Something else" },
  ],
  environment: [
    { id: "food_home", label: "Food at home" },
    { id: "food_work", label: "Food at work" },
    { id: "phone_screens", label: "My phone or screens" },
    { id: "training_logistics", label: "Training logistics" },
    { id: "work_setup", label: "My work setup" },
    { id: "social_environment", label: "My family or social environment" },
    { id: "other", label: "Something else" },
  ],
  overload: [
    { id: "work_bandwidth", label: "Work consumes most of my available bandwidth" },
    { id: "family_bandwidth", label: "Family responsibilities consume most of it" },
    { id: "too_many_commitments", label: "I have too many commitments" },
    { id: "boundaries", label: "I struggle to say no or set boundaries" },
    { id: "fill_time", label: "I fill almost every available piece of time" },
    { id: "temporary", label: "Life is temporarily much more demanding than normal" },
    { id: "not_sure_remove", label: "I'm not sure what I could realistically remove" },
    { id: "other", label: "Something else" },
  ],
  support: [
    { id: "someone_knows", label: "I need someone else to know exactly what I'm trying to do" },
    { id: "checks_help", label: "I follow through better when someone checks in" },
    { id: "household_misaligned", label: "My family or household isn't aligned with the change" },
    { id: "need_structure", label: "I need more structure around the behavior" },
    { id: "initiation", label: "I know what to do but struggle to initiate it on my own" },
    { id: "mostly_alone", label: "I'm trying to make the change mostly by myself" },
    { id: "other", label: "Something else" },
  ],
  recovery_depletion: [
    { id: "training_load", label: "My training load may be too high" },
    { id: "life_stress", label: "Life stress has been unusually high" },
    { id: "probably_sleep", label: "I'm probably not sleeping enough" },
    { id: "no_true_recovery", label: "I rarely have true recovery time" },
    { id: "pushing_long_time", label: "I've been pushing hard for a long time without backing off" },
    { id: "unexplained", label: "I'm doing many of the right things and I'm not sure why I still feel depleted", stopFlag: true },
    { id: "other", label: "Something else" },
  ],
  physical: [
    { id: "pain_limits", label: "Pain or another physical limitation changes what I can do or derails my consistency", stopFlag: true },
    { id: "other", label: "Something else" },
  ],
};

// Q7 — Common difficulty / friction (choose up to TWO, not dependent on Q5)
export const Q7_PROMPT = "What usually makes this hardest?";
export const Q7_OPTIONS = [
  { id: "time", label: "Time" },
  { id: "energy", label: "Energy" },
  { id: "schedule_changes", label: "Schedule changes" },
  { id: "stress_changes_choices", label: "Stress changes my choices" },
  { id: "forget", label: "I forget" },
  { id: "competing_enjoyable", label: "The competing behavior is enjoyable/rewarding" },
  { id: "social_situations", label: "Other people / social situations" },
  { id: "environment_access", label: "Environment / access" },
  { id: "start_too_big", label: "I start too big" },
  { id: "lose_momentum", label: "I lose momentum after one miss" },
  { id: "pain_symptoms", label: "Pain / symptoms / physical limitation" },
  { id: "not_sure", label: "I'm not sure" },
  { id: "other", label: "Something else" },
];

// Q8 — Function (CONDITIONAL ONLY — only show when triggered, see shouldShowQ8 below)
export const Q8_PROMPT = "What does the competing behavior mostly give you?";
export const Q8_OPTIONS = [
  { id: "relaxation_escape", label: "Relaxation / escape" },
  { id: "reward", label: "Reward / something to look forward to" },
  { id: "personal_time", label: "Personal time / autonomy" },
  { id: "connection", label: "Connection / social enjoyment" },
  { id: "convenience", label: "Convenience" },
  { id: "stimulation", label: "Stimulation / entertainment" },
  { id: "not_sure", label: "I'm not sure" },
  { id: "other", label: "Something else" },
];

// Q8 trigger rule (Section 4.9): show only if one of these holds.
// coachRequested lets the coach manually force Q8 to display, per spec.
export function shouldShowQ8({ q4, q5, q6, q7, coachRequested = false }) {
  if (coachRequested) return true;
  if (q7?.includes("competing_enjoyable")) return true;
  if (q5 === "sleep" && (q6 === "personal_time" || q6 === "screens")) return true;
  if (q5 === "stress_downshift" && q6 === "competing_relief") return true;
  if (q5 === "weekends" && (q6 === "alcohol" || q6 === "social_eating")) return true;
  if (q5 === "environment") return true; // recurring competing behavior in environment terrain
  if (q4 === "alcohol") return true; // member hypothesis is alcohol
  return false;
}

// Stop flags — halt automatic Move matching, require coach review (Section 3 + Section 38 stopFlag markers + Q5 "other").
// A stop flag is triggered if Q5 === "other", OR the chosen Q6 mechanism option has stopFlag: true.
export function isStopFlagged({ q5, q6 }) {
  if (q5 === "other") return true;
  const branch = Q6_BRANCHES[q5];
  if (!branch) return false;
  const chosen = branch.find((o) => o.id === q6);
  return !!chosen?.stopFlag;
}

// Baseline validation tap (Section 4.10) — single 1-5 scale, stored as baseline Constraint Impact.
export const BASELINE_IMPACT_PROMPT = "How much is this currently getting in the way?";
export const BASELINE_IMPACT_LABELS = { 1: "Barely at all", 5: "A lot" };
