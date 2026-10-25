export type SupportedLanguageCode =
  | "hi-IN"
  | "en-IN"
  | "mr-IN"
  | "ta-IN"
  | "te-IN"
  | "bn-IN"
  | "gu-IN"
  | "kn-IN"
  | "ml-IN"
  | "pa-IN"
  | "od-IN"
  | "unknown";

export interface SupportedLanguage {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  context: string;
  defaultAssumption: string;
  userAnswer?: string;
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface NonFunctionalRequirement {
  id: string;
  category: "Performance" | "Security" | "Reliability" | "Usability" | "Compliance";
  description: string;
  metric: string;
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
}

export interface Milestone {
  id: string;
  phase: string;
  deliverables: string[];
  estimatedWeeks: number;
}

export interface SuccessMetric {
  id: string;
  metric: string;
  target: string;
  measurementMethod: string;
}

export interface StructuredBRD {
  metadata: {
    projectName: string;
    targetLanguage: string;
    generatedAt: string;
    engine: "BhashaBRD" | "DemoEngine";
    isDemo: boolean;
    modelUsed?: string;
  };
  summary: {
    executiveSummary: string;
    problemStatement: string;
    proposedSolution: string;
  };
  businessObjectives: string[];
  stakeholders: Array<{
    role: string;
    responsibilities: string;
  }>;
  scope: {
    inScope: string[];
    outOfScope: string[];
  };
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirement[];
  userStories: UserStory[];
  businessRules: Array<{
    id: string;
    rule: string;
    impact: string;
  }>;
  dependenciesAndAssumptions: {
    dependencies: Array<{ id: string; description: string }>;
    assumptions: Array<{ id: string; description: string; impactIfNotMet: string }>;
  };
  risksAndOpenQuestions: {
    risks: Array<{ id: string; risk: string; mitigation: string; severity: "High" | "Medium" | "Low" }>;
    openQuestions: string[];
  };
  milestones: Milestone[];
  successMetrics: SuccessMetric[];
  markdownContent: string;
}

export interface TranscriptionResponse {
  transcript: string;
  language_code: string;
  request_id?: string;
  isDemo?: boolean;
}

export interface ClarificationResponse {
  questions: ClarificationQuestion[];
  isDemo: boolean;
  modelUsed?: string;
}

export interface GenerateBrdResponse {
  brd: StructuredBRD;
  isDemo: boolean;
  modelUsed?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
  statusCode?: number;
}
