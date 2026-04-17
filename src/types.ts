export interface SocialMediaReport {
  id: string;
  quarter: string;
  year: number;
  followersCurrent: number;
  followersPrevious: number;
  totalReach: number;
  totalInteractions: number;
  createdAt: string;
}

export interface CalculationResult {
  reachRate: number;
  reachIndex: number;
  engagementRate: number;
  engagementIndex: number;
  growthRate: number;
  growthIndex: number;
  finalScore: number;
}
