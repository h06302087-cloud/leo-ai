import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Type Definitions
interface Agent {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  memory?: { maxMessages: number };
  tools?: any[];
  createdAt: string;
  status: 'active' | 'inactive';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Validation Schemas
const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  model: z.enum(['gpt-4', 'gpt-4o', 'claude-3-opus', 'claude-3-sonnet-20240229']),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(2000),
  memory: z.object({ maxMessages: z.number().default(20) }).optional(),
});

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().optional(),
  context: z.record(z.any()).optional(),
});

// In-memory storage (TODO: Replace with Firestore)
const agents = new Map<string, Agent>();
const conversations = new Map<string, ChatMessage[]>();

// API Key Management
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!openaiKey && !anthropicKey) {
  console.warn('⚠️  No AI API keys configured. Some endpoints will fail.');
}

/**
 * POST /api/agents/create
 * Create a new AI agent with specified configuration
 */
router.post('/create', (req: Request, res: Response) => {
  try {
    const validatedData = createAgentSchema.parse(req.body);
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const agent: Agent = {
      id: agentId,
      ...validatedData,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    
    agents.set(agentId, agent);
    res.status(201).json({ success: true, data: { agentId, createdAt: agent.createdAt } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agents/:agentId/chat
 * Send a message to an agent and get a response
 */
router.post('/:agentId/chat', async (req: Request, res: Response) => {
  try {
    const agent = agents.get(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const validatedData = chatSchema.parse(req.body);
    const { message, conversationId } = validatedData;
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Get or create conversation history
    let history = conversations.get(convId) || [];
    history.push({ role: 'user', content: message });

    try {
      let response: string;
      let tokensUsed = 0;

      // Route to appropriate LLM provider
      if (agent.model.startsWith('claude')) {
        if (!anthropicKey) {
          return res.status(503).json({ success: false, error: 'Anthropic API not configured' });
        }
        // TODO: Implement actual Anthropic call
        response = '[Claude response placeholder]';
        tokensUsed = 100;
      } else {
        if (!openaiKey) {
          return res.status(503).json({ success: false, error: 'OpenAI API not configured' });
        }
        // TODO: Implement actual OpenAI call
        response = '[OpenAI response placeholder]';
        tokensUsed = 100;
      }

      history.push({ role: 'assistant', content: response });

      // Trim history if too long
      const maxMessages = agent.memory?.maxMessages || 20;
      if (history.length > maxMessages * 2) {
        history = history.slice(-(maxMessages * 2));
      }

      conversations.set(convId, history);

      res.json({
        success: true,
        data: { response, tokens: tokensUsed, conversationId: convId },
      });
    } catch (apiError: any) {
      res.status(502).json({ success: false, error: `LLM API Error: ${apiError.message}` });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agents/:agentId
 * Retrieve agent configuration
 */
router.get('/:agentId', (req: Request, res: Response) => {
  try {
    const agent = agents.get(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agents/:agentId/memory
 * Retrieve agent conversation history
 */
router.get('/:agentId/memory', (req: Request, res: Response) => {
  try {
    const agent = agents.get(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const allMessages: any[] = [];
    conversations.forEach((history) => {
      allMessages.push(...history);
    });

    res.json({
      success: true,
      data: {
        memories: allMessages.slice(-limit),
        metadata: { count: allMessages.length, limit },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
