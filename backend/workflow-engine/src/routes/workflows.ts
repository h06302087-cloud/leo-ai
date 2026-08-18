import { Router, Request, Response } from 'express';
import cron from 'node-cron';
import { z } from 'zod';

const router = Router();

// Type Definitions
interface WorkflowNode {
  id: string;
  type: string;
  data?: Record<string, any>;
  position?: { x: number; y: number };
}

interface WorkflowEdge {
  source: string;
  target: string;
  label?: string;
}

interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: any[];
  createdAt: string;
  isActive: boolean;
  description?: string;
}

interface Execution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  completedAt?: string;
  nodeResults: any[];
  error?: string;
}

// Validation Schemas
const workflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['webhook', 'http', 'condition', 'agent', 'python', 'email', 'slack', 'manual', 'schedule', 'event']),
    data: z.record(z.any()).optional(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
  })),
  edges: z.array(z.object({
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
  })),
  triggers: z.array(z.record(z.any())).optional(),
});

const executionSchema = z.object({
  inputData: z.record(z.any()).optional(),
});

// In-memory storage
const workflows = new Map<string, Workflow>();
const executions = new Map<string, Execution>();
const cronJobs = new Map<string, cron.ScheduledTask>();

// Node execution handlers
const nodeExecutors: Record<string, (config: any, input: any) => Promise<any>> = {
  webhook: async (config: any, input: any) => ({
    statusCode: 200,
    body: { received: true, timestamp: new Date().toISOString() },
  }),
  http: async (config: any, input: any) => {
    if (!config.url) throw new Error('HTTP node requires URL in config');
    // TODO: Implement actual HTTP call with axios
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
  python: async (config: any, input: any) => {
    if (!config.code) throw new Error('Python node requires code in config');
    // TODO: Implement Docker sandbox execution
    return {
      output: 'Script executed successfully',
      executionTime: `${(Math.random() * 2).toFixed(2)}s`,
    };
  },
  email: async (config: any, input: any) => {
    if (!config.to) throw new Error('Email node requires recipient');
    // TODO: Implement actual email sending
    return {
      queued: true,
      messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
    };
  },
  slack: async (config: any, input: any) => {
    if (!config.channelId) throw new Error('Slack node requires channelId');
    // TODO: Implement actual Slack API call
    return {
      posted: true,
      ts: Date.now().toString(),
    };
  },
  manual: async (config: any, input: any) => ({
    status: 'awaiting_approval',
    message: config.message || 'Awaiting manual approval',
  }),
  schedule: async (config: any, input: any) => ({
    status: 'scheduled',
    nextRun: new Date(Date.now() + 60000).toISOString(),
  }),
  event: async (config: any, input: any) => ({
    status: 'listening',
    eventType: config.eventType,
  }),
};

/**
 * POST /api/workflows/create
 * Create a new workflow
 */
router.post('/create', (req: Request, res: Response) => {
  try {
    const result = workflowSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.flatten() });
    }

    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const workflow: Workflow = {
      id: workflowId,
      ...result.data,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    workflows.set(workflowId, workflow);

    // Setup cron triggers if present
    const cronTrigger = workflow.triggers?.find((t: any) => t.type === 'schedule');
    if (cronTrigger?.config?.cron) {
      try {
        const task = cron.schedule(cronTrigger.config.cron, () => {
          console.log(`✓ Cron triggered for workflow ${workflowId}`);
        });
        cronJobs.set(workflowId, task);
      } catch (cronError) {
        console.error(`Cron scheduling error: ${cronError}`);
      }
    }

    res.status(201).json({ success: true, data: { workflowId, createdAt: workflow.createdAt } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/workflows/:workflowId/validate
 * Validate workflow structure and connectivity
 */
router.post('/:workflowId/validate', (req: Request, res: Response) => {
  try {
    const workflow = workflows.get(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate nodes exist
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // Validate node connectivity
    const nodeIds = new Set(workflow.nodes.map((n) => n.id));
    const connectedNodes = new Set<string>();
    (workflow.edges || []).forEach((e) => {
      if (!nodeIds.has(e.source)) errors.push(`Edge references non-existent source node: ${e.source}`);
      if (!nodeIds.has(e.target)) errors.push(`Edge references non-existent target node: ${e.target}`);
      connectedNodes.add(e.source);
      connectedNodes.add(e.target);
    });

    workflow.nodes.forEach((node) => {
      if (!connectedNodes.has(node.id) && workflow.nodes.length > 1) {
        warnings.push(`Node ${node.id} is not connected to the workflow`);
      }
      if (!nodeExecutors[node.type]) {
        errors.push(`Unknown node type: ${node.type}`);
      }
    });

    // Check for at least one trigger
    const hasTrigger = workflow.nodes.some((n) =>
      ['webhook', 'schedule', 'manual', 'event'].includes(n.type)
    );
    if (!hasTrigger) {
      errors.push('Workflow must have at least one trigger node (webhook, schedule, manual, or event)');
    }

    res.json({ success: true, data: { isValid: errors.length === 0, errors, warnings } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/workflows/:workflowId/execute
 * Execute a workflow
 */
router.post('/:workflowId/execute', async (req: Request, res: Response) => {
  try {
    const workflow = workflows.get(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const validationResult = workflowSchema.safeParse(workflow);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, error: 'Workflow validation failed', details: validationResult.error.flatten() });
    }

    const executionData = executionSchema.safeParse(req.body);
    if (!executionData.success) {
      return res.status(400).json({ success: false, error: 'Invalid execution data', details: executionData.error.flatten() });
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const execution: Execution = {
      id: executionId,
      workflowId: req.params.workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      nodeResults: [],
    };
    executions.set(executionId, execution);

    // Build execution graph
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));
    const edgeMap = new Map<string, string[]>();
    workflow.edges.forEach((e) => {
      if (!edgeMap.has(e.source)) edgeMap.set(e.source, []);
      edgeMap.get(e.source)!.push(e.target);
    });

    const visited = new Set<string>();
    const executeNode = async (nodeId: string, input: any): Promise<any> => {
      if (visited.has(nodeId)) return input;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return input;

      const executor = nodeExecutors[node.type];
      if (!executor) throw new Error(`No executor for node type: ${node.type}`);

      const startTime = Date.now();
      const output = await executor(node.data?.config || {}, input);
      const executionTime = Date.now() - startTime;

      execution.nodeResults.push({
        nodeId,
        status: 'success',
        output,
        executionTime,
        completedAt: new Date().toISOString(),
      });

      // Execute next nodes
      const nextNodes = edgeMap.get(nodeId) || [];
      for (const nextNodeId of nextNodes) {
        await executeNode(nextNodeId, output);
      }

      return output;
    };

    // Find and execute trigger nodes
    const triggerNodes = workflow.nodes.filter((n) =>
      ['webhook', 'schedule', 'manual', 'event'].includes(n.type)
    );

    try {
      for (const trigger of triggerNodes) {
        await executeNode(trigger.id, executionData.data.inputData || {});
      }
      execution.status = 'success';
      execution.completedAt = new Date().toISOString();
      res.status(200).json({ success: true, data: { executionId, status: 'success', nodeResults: execution.nodeResults } });
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date().toISOString();
      res.status(400).json({ success: false, error: error.message, executionId });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/workflows/:workflowId/executions
 * Get execution history
 */
router.get('/:workflowId/executions', (req: Request, res: Response) => {
  try {
    const workflowExecutions = Array.from(executions.values())
      .filter((e) => e.workflowId === req.params.workflowId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    res.json({
      success: true,
      data: workflowExecutions.slice(offset, offset + limit),
      pagination: {
        limit,
        offset,
        total: workflowExecutions.length,
        pages: Math.ceil(workflowExecutions.length / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/workflows/:workflowId/test-node
 * Test a single node
 */
router.post('/:workflowId/test-node', async (req: Request, res: Response) => {
  try {
    const { nodeId, inputData } = req.body;
    if (!nodeId) {
      return res.status(400).json({ success: false, error: 'nodeId is required' });
    }

    const workflow = workflows.get(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }

    const executor = nodeExecutors[node.type];
    if (!executor) {
      return res.status(400).json({ success: false, error: `Unknown node type: ${node.type}` });
    }

    const startTime = Date.now();
    try {
      const output = await executor(node.data?.config || {}, inputData || {});
      const executionTime = Date.now() - startTime;
      res.json({ success: true, data: { output, executionTime, errors: [] } });
    } catch (executorError: any) {
      res.status(400).json({ success: false, error: executorError.message });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/workflows/:workflowId
 * Get workflow details
 */
router.get('/:workflowId', (req: Request, res: Response) => {
  try {
    const workflow = workflows.get(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    res.json({ success: true, data: workflow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/workflows/:workflowId
 * Delete a workflow
 */
router.delete('/:workflowId', (req: Request, res: Response) => {
  try {
    const workflow = workflows.get(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // Stop cron job if exists
    const cronJob = cronJobs.get(req.params.workflowId);
    if (cronJob) {
      cronJob.stop();
      cronJobs.delete(req.params.workflowId);
    }

    workflows.delete(req.params.workflowId);
    res.json({ success: true, data: { message: 'Workflow deleted' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
