import { RuleBookEntry } from './types';

export const STATIC_RULEBOOK: RuleBookEntry[] = [
  {
    category: "Fouls",
    rules: [
      { title: "Personal Foul", summary: "Illegal contact with an opponent." },
      { title: "Technical Foul", summary: "Non-contact foul of a behavioral nature." },
      { title: "Unsportsmanlike Foul", summary: "Contact with no legitimate attempt to play the ball." }
    ]
  },
  {
    category: "Violations",
    rules: [
      { title: "Traveling", summary: "Moving the pivot foot illegally." },
      { title: "Double Dribble", summary: "Dribbling again after ending a dribble." },
      { title: "24-Second Violation", summary: "Failure to shoot within the shot clock time." },
      { title: "Goaltending", summary: "Interfering with the ball on its downward flight to the basket." }
    ]
  }
];