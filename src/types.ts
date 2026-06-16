export interface Decision {
  title: string;
  reason: string;
  status: string;
}

export interface RepositoryMemory {
  architectureDecisions: Decision[];
  conventions: string[];
}

export interface ArchitectureRatings {
  scalability: number;
  scalabilityDetails: string;
  security: number;
  securityDetails: string;
  maintainability: number;
  maintainabilityDetails: string;
  performance: number;
  performanceDetails: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string; // 'module' | 'file' | 'database' | 'api' | 'external'
  details: string;
  complexity: string; // 'Low' | 'Medium' | 'High'
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Step {
  from: string;
  to: string;
  message: string;
  details: string;
}

export interface Sequence {
  scenario: string;
  steps: Step[];
}

export interface Risk {
  severity: string; // 'Low' | 'Medium' | 'High' | 'Critical'
  title: string;
  description: string;
  mitigation: string;
}

export interface Suggestion {
  title: string;
  description: string;
  impact: string;
}

export interface CtoOverview {
  risks: Risk[];
  suggestions: Suggestion[];
}

export interface Bottleneck {
  resource: string;
  likelihood: string;
  timeline: string;
  impact: string;
}

export interface GrowthTrajectory {
  label: string;
  expectedComplexity: number;
}

export interface PredictiveAnalysis {
  bottlenecks: Bottleneck[];
  growthTrajectory: GrowthTrajectory[];
}

export interface AnalysisResult {
  systemName: string;
  repositoryMemory: RepositoryMemory;
  architectureRatings: ArchitectureRatings;
  dependencyGraph: DependencyGraph;
  sequences: Sequence[];
  ctoOverview: CtoOverview;
  predictiveAnalysis: PredictiveAnalysis;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
