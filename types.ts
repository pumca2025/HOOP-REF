export interface RuleAnalysis {
  official_decision: string;
  infraction_type: string;
  situation_summary: string;
  applied_rules: string[];
  detailed_reasoning: string;
  rule_book_references: string[];
  penalty: string;
  id?: string;
  timestamp?: string;
}

export enum AppView {
  ANALYZE = 'ANALYZE',
  HISTORY = 'HISTORY',
  RULEBOOK = 'RULEBOOK',
  PROFILE = 'PROFILE',
  ABOUT = 'ABOUT',
  VERIFY_OTP = 'VERIFY_OTP'
}