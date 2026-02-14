export interface RuleAnalysis {
  situation: string;
  ruleApplied: string;
  article: string;
  decision: string;
  penalty: string;
  id?: string;
  timestamp?: string;
}

export enum AppView {
  ANALYZE = 'ANALYZE',
  HISTORY = 'HISTORY',
  RULEBOOK = 'RULEBOOK',
  PROFILE = 'PROFILE',
  ABOUT = 'ABOUT'
}