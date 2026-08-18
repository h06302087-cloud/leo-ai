export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  preferences: {
    theme: 'dark' | 'light' | 'system';
    language: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  pages: Page[];
  workflows: Workflow[];
  integrations: Integration[];
  deployments: Deployment[];
}

export interface Page {
  id: string;
  name: string;
  route: string;
  layout: LayoutConfig;
  components: UIComponent[];
  bindings: DataBinding[];
}

export interface LayoutConfig {
  type: 'grid' | 'flex' | 'absolute';
  columns?: number;
  gap?: number;
  padding?: number;
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  styles: Record<string, string>;
  children?: UIComponent[];
  binding?: DataBinding;
}

export type ComponentType = 
  | 'container' | 'grid' | 'card' | 'form' | 'input' | 'button' 
  | 'select' | 'table' | 'chart' | 'modal' | 'text' | 'image';

export interface DataBinding {
  id: string;
  collectionPath: string;
  fieldMapping: Record<string, string>;
  query?: QueryConfig;
}

export interface QueryConfig {
  where?: Array<{ field: string; op: string; value: unknown }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: TriggerConfig[];
  variables: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type NodeType = 
  | 'webhook' | 'schedule' | 'event' | 'manual'
  | 'http' | 'condition' | 'transform' | 'loop'
  | 'agent' | 'python' | 'email' | 'slack'
  | 'json' | 'filter' | 'aggregate' | 'database';

export interface NodeData {
  label: string;
  config: Record<string, unknown>;
  inputs?: Record<string, InputDef>;
  outputs?: Record<string, OutputDef>;
}

export interface InputDef {
  type: string;
  required: boolean;
  description?: string;
}

export interface OutputDef {
  type: string;
  description?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string;
}

export interface TriggerConfig {
  type: 'webhook' | 'schedule' | 'event' | 'manual';
  config: Record<string, unknown>;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: AgentTool[];
  memory: MemoryConfig;
  status: 'active' | 'idle' | 'error';
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler?: string;
}

export interface MemoryConfig {
  shortTerm: boolean;
  longTerm: boolean;
  maxMessages: number;
}

export interface Integration {
  id: string;
  service: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
  scopes: string[];
  connectedAt?: string;
}

export interface Deployment {
  id: string;
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'building' | 'deployed' | 'failed';
  url?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  nodeResults: NodeResult[];
  error?: string;
}

export interface NodeResult {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  output?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ExportConfig {
  projectId: string;
  includeFrontend: boolean;
  includeBackend: boolean;
  includeDocker: boolean;
  includeFirebase: boolean;
  environment: string;
}
