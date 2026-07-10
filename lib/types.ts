export type FlowNodeType =
  | 'start'
  | 'end'
  | 'declare'
  | 'input'
  | 'output'
  | 'assign'
  | 'if'
  | 'while'
  | 'for'
  | 'comment';

export interface FlowNodeData {
  label: string;
  variable?: string;
  expression?: string;
  condition?: string;
  start?: string;
  end?: string;
  direction?: 'inc' | 'dec';
  step?: string;
  comment?: string;
  varType?: string;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowchartModel {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface GenerateRequest {
  prompt: string;
  provider?: 'openai' | 'openrouter' | 'custom';
  model?: string;
  apiKey?: string;
  apiUrl?: string;
  jsonMode?: boolean;
}

export interface AiSettings {
  provider: 'openai' | 'openrouter' | 'custom';
  model: string;
  apiKey: string;
  apiUrl: string;
}

export interface GenerateResponse {
  flowchart: FlowchartModel;
}
