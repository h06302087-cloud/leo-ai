'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import {
  Globe, Clock, Play, GitBranch, ArrowLeftRight, Bot,
  Mail, Hash, Braces, Filter, Trash2, Save, Zap,
  ChevronRight, Search
} from 'lucide-react';

const NODE_TYPES = {
  trigger: { color: '#F2A93B', bg: 'rgba(242,169,59,0.1)', border: 'rgba(242,169,59,0.3)' },
  action: { color: '#5FA8FF', bg: 'rgba(95,168,255,0.1)', border: 'rgba(95,168,255,0.3)' },
  ai: { color: '#4FE0BE', bg: 'rgba(79,224,190,0.1)', border: 'rgba(79,224,190,0.3)' },
  integration: { color: '#B98CFF', bg: 'rgba(185,140,255,0.1)', border: 'rgba(185,140,255,0.3)' },
  data: { color: '#FF8FB1', bg: 'rgba(255,143,177,0.1)', border: 'rgba(255,143,177,0.3)' },
};

const PALETTE_ITEMS = [
  { category: 'Triggers', items: [
    { type: 'webhook', label: 'Webhook', icon: Globe, sub: 'HTTP trigger', cat: 'trigger' },
    { type: 'schedule', label: 'Schedule', icon: Clock, sub: 'Cron trigger', cat: 'trigger' },
    { type: 'manual', label: 'Manual', icon: Play, sub: 'Run manually', cat: 'trigger' },
  ]},
  { category: 'Actions', items: [
    { type: 'http', label: 'HTTP Request', icon: Globe, sub: 'API call', cat: 'action' },
    { type: 'condition', label: 'Condition', icon: GitBranch, sub: 'If/Else logic', cat: 'action' },
    { type: 'transform', label: 'Transform', icon: ArrowLeftRight, sub: 'Data mapping', cat: 'action' },
  ]},
  { category: 'AI', items: [
    { type: 'agent', label: 'AI Agent', icon: Bot, sub: 'LLM call', cat: 'ai' },
  ]},
  { category: 'Integrations', items: [
    { type: 'email', label: 'Email', icon: Mail, sub: 'Send message', cat: 'integration' },
    { type: 'slack', label: 'Slack', icon: Hash, sub: 'Post message', cat: 'integration' },
  ]},
  { category: 'Data', items: [
    { type: 'json', label: 'JSON Parser', icon: Braces, sub: 'Parse JSON', cat: 'data' },
    { type: 'filter', label: 'Filter', icon: Filter, sub: 'Filter data', cat: 'data' },
  ]},
];

const initialNodes: Node[] = [
  { id: '1', type: 'default', position: { x: 50, y: 200 }, data: { label: 'Webhook Trigger', type: 'webhook', cat: 'trigger', config: { path: '/tickets/new', method: 'POST' } }, style: { width: 200 } },
  { id: '2', type: 'default', position: { x: 350, y: 200 }, data: { label: 'Fetch Details', type: 'http', cat: 'action', config: { method: 'GET', url: 'https://api.example.com/tickets/{id}' } }, style: { width: 200 } },
  { id: '3', type: 'default', position: { x: 650, y: 200 }, data: { label: 'Draft Response', type: 'agent', cat: 'ai', config: { model: 'claude-sonnet', temperature: 0.7 } }, style: { width: 200 } },
  { id: '4', type: 'default', position: { x: 950, y: 200 }, data: { label: 'Needs Review?', type: 'condition', cat: 'action', config: { expression: 'confidence >= 0.75' } }, style: { width: 200 } },
  { id: '5', type: 'default', position: { x: 1250, y: 100 }, data: { label: 'Reply Customer', type: 'email', cat: 'integration', config: { to: '{{customer.email}}' } }, style: { width: 200 } },
  { id: '6', type: 'default', position: { x: 1250, y: 300 }, data: { label: 'Escalate', type: 'slack', cat: 'integration', config: { channel: '#support' } }, style: { width: 200 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', label: 'then' },
  { id: 'e4-6', source: '4', target: '6', label: 'else' },
];

function CustomNode({ data }: { data: any }) {
  const style = NODE_TYPES[data.cat as keyof typeof NODE_TYPES] || NODE_TYPES.action;
  return (
    <div className="px-4 py-3 rounded-lg bg-card border" style={{ borderColor: style.border, width: 200 }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: style.color }} />
        <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: style.color }}>{data.cat}</span>
      </div>
      <div className="font-medium text-sm">{data.label}</div>
      <div className="text-xs text-muted-foreground font-mono mt-1 truncate">
        {data.type === 'webhook' && `${data.config.method} ${data.config.path}`}
        {data.type === 'http' && `${data.config.method} ${data.config.url}`}
        {data.type === 'agent' && `${data.config.model} · t=${data.config.temperature}`}
        {data.type === 'condition' && data.config.expression}
        {data.type === 'email' && `to ${data.config.to}`}
        {data.type === 'slack' && data.config.channel}
      </div>
    </div>
  );
}

const nodeTypes = { default: CustomNode };

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = (type: string, cat: string, label: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label, type, cat, config: {} },
      style: { width: 200 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsRunning(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Palette */}
      <div className="w-64 bg-card border-r border-border flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Nodes</h3>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input type="text" placeholder="Search nodes..." className="w-full pl-7 pr-3 py-1.5 rounded bg-background border border-border text-sm focus:border-primary outline-none" />
          </div>
        </div>
        <div className="p-3 space-y-4">
          {PALETTE_ITEMS.map((group) => (
            <div key={group.category}>
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">{group.category}</div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addNode(item.type, item.cat, item.label)}
                    className="w-full p-2.5 rounded-lg bg-accent/30 border border-border hover:border-primary/50 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: NODE_TYPES[item.cat as keyof typeof NODE_TYPES].bg }}>
                        <item.icon className="w-3.5 h-3.5" style={{ color: NODE_TYPES[item.cat as keyof typeof NODE_TYPES].color }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-[10px] text-muted-foreground">{item.sub}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Support Ticket Automation</h3>
            <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setNodes(initialNodes); setEdges(initialEdges); }} className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-accent text-sm transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear</button>
            <button className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-accent text-sm transition-colors flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            <button onClick={runWorkflow} disabled={isRunning} className={cn("px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2", isRunning ? 'bg-emerald-500/50' : 'bg-emerald-600 hover:bg-emerald-500')}>
              <Zap className="w-4 h-4" /> {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background gap={20} size={1} color="#334155" />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Panel position="top-left" className="bg-card border border-border rounded-lg p-3 text-xs text-muted-foreground">
              <p><strong className="text-foreground">Drag</strong> nodes to reposition</p>
              <p><strong className="text-foreground">Connect</strong> handles to link nodes</p>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Properties */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        <div className="p-4 border-b border-border"><h3 className="font-semibold text-sm">Node Configuration</h3></div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-mono">Node Type</label>
                <div className="mt-1 px-3 py-2 rounded bg-accent/50 border border-border text-sm font-medium">{selectedNode.data.label}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase font-mono">ID</label>
                <div className="mt-1 px-3 py-2 rounded bg-accent/50 border border-border text-sm font-mono text-muted-foreground">{selectedNode.id}</div>
              </div>
              {Object.entries(selectedNode.data.config).map(([key, value]) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground uppercase font-mono">{key}</label>
                  <input type="text" defaultValue={value as string} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none" />
                </div>
              ))}
              <div className="pt-4 border-t border-border">
                <button className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
                  Test Node
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <GitBranch className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm">Select a node to configure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
