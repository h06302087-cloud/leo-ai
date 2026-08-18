import { Router } from 'express';
import cron from 'node-cron';

const router = Router();
const workflows = new Map();
const executions = new Map();

// Node execution handlers
const nodeExecutors: Record<string, Function> = {
  webhook: async (config: any, input: any) => ({
    statusCode: 200,
    body: { received: true, timestamp: new Date().toISOString() },
  }),
  http: async (config: any, input: any) => {
    // In production, use axios/fetch
    return {
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 200) + 50,
      data: { success: true },
    };
  },
  condition: async (config: any, input: any) => {
    const result = Math.random() > 0.3;
    return { result, branch: result ? 'then' : 'else' };
  },
  agent: async (config: any, input: any) => ({
    response: 'AI processed the request successfully.',
    tokensUsed: Math.floor(Math.random() * 500) + 100,
    model: config.model || 'gpt-4',
  }),
  python: async (config: any, input: any) => ({
    output: 'Script executed successfully',
    executionTime: `${(Math.random() * 2).toFixed(2)}s`,
  }),
  email: async (config: any, input: any) => ({
    queued: true,
    messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
  }),
  slack: async (config: any, input: any) => ({
    posted: true,
    ts: Date.now().toString(),
  }),
};

router.post('/create', (req, res) => {
  const workflowId = `wf_${Date.now()}`;
  const workflow = {
    id: workflowId,
    ...req.body,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  workflows.set(workflowId, workflow);

  // Setup cron triggers
  const cronTrigger = workflow.triggers?.find((t: any) => t.type === 'schedule');
  if (cronTrigger) {
    cron.schedule(cronTrigger.config.cron, () => {
      console.log(`Cron triggered for workflow ${workflowId}`);
    });
  }

  res.json({ success: true, data: { workflowId, createdAt: workflow.createdAt } });
});

router.post('/:workflowId/validate', (req, res) => {
  const workflow = workflows.get(req.params.workflowId);
  if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate nodes have connections
  const nodeIds = new Set(workflow.nodes.map((n: any) => n.id));
  const connectedNodes = new Set();
  workflow.edges.forEach((e: any) => {
    connectedNodes.add(e.source);
    connectedNodes.add(e.target);
  });

  workflow.nodes.forEach((node: any) => {
    if (!connectedNodes.has(node.id) && workflow.nodes.length > 1) {
      warnings.push(`Node ${node.id} is not connected`);
    }
  });

  // Check for triggers
  const hasTrigger = workflow.nodes.some((n: any) =>
    ['webhook', 'schedule', 'manual', 'event'].includes(n.data?.type)
  );
  if (!hasTrigger) errors.push('Workflow must have at least one trigger node');

  res.json({ success: true, data: { isValid: errors.length === 0, errors, warnings } });
});

router.post('/:workflowId/execute', async (req, res) => {
  const workflow = workflows.get(req.params.workflowId);
  if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

  const executionId = `exec_${Date.now()}`;
  const execution = {
    id: executionId,
    workflowId: req.params.workflowId,
    status: 'running',
    startedAt: new Date().toISOString(),
    nodeResults: [],
  };
  executions.set(executionId, execution);

  // Simple sequential execution (in production, use topological sort)
  const nodeMap = new Map(workflow.nodes.map((n: any) => [n.id, n]));
  const visited = new Set();

  const executeNode = async (nodeId: string, input: any): Promise<any> => {
    if (visited.has(nodeId)) return input;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) return input;

    const executor = nodeExecutors[node.data?.type];
    const output = executor ? await executor(node.data?.config || {}, input) : input;

    execution.nodeResults.push({
      nodeId,
      status: 'success',
      output,
      completedAt: new Date().toISOString(),
    });

    // Find next nodes
    const nextEdges = workflow.edges.filter((e: any) => e.source === nodeId);
    for (const edge of nextEdges) {
      // Handle conditional branches
      if (edge.label && output?.branch && edge.label !== output.branch) continue;
      await executeNode(edge.target, output);
    }

    return output;
  };

  // Find trigger nodes
  const triggerNodes = workflow.nodes.filter((n: any) =>
    ['webhook', 'schedule', 'manual', 'event'].includes(n.data?.type)
  );

  try {
    for (const trigger of triggerNodes) {
      await executeNode(trigger.id, req.body.inputData || {});
    }
    execution.status = 'success';
    execution.completedAt = new Date().toISOString();
    res.json({ success: true, data: { executionId, status: 'success', output: execution.nodeResults } });
  } catch (error: any) {
    execution.status = 'failed';
    execution.error = error.message;
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:workflowId/executions', (req, res) => {
  const workflowExecutions = Array.from(executions.values())
    .filter((e: any) => e.workflowId === req.params.workflowId)
    .sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  res.json({
    success: true,
    data: workflowExecutions.slice(offset, offset + limit),
    pagination: { page: Math.floor(offset / limit) + 1, limit, total: workflowExecutions.length, totalPages: Math.ceil(workflowExecutions.length / limit) },
  });
});

router.post('/:workflowId/test-node', async (req, res) => {
  const { nodeId, inputData } = req.body;
  const workflow = workflows.get(req.params.workflowId);
  if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

  const node = workflow.nodes.find((n: any) => n.id === nodeId);
  if (!node) return res.status(404).json({ success: false, error: 'Node not found' });

  const executor = nodeExecutors[node.data?.type];
  if (!executor) return res.status(400).json({ success: false, error: 'Unknown node type' });

  const startTime = Date.now();
  try {
    const output = await executor(node.data?.config || {}, inputData);
    res.json({
      success: true,
      data: { output, executionTime: Date.now() - startTime, errors: [] },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
