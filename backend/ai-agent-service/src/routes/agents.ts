import { Router } from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const agents = new Map();
const conversations = new Map();

router.post('/create', (req, res) => {
  const agentId = `agent_${Date.now()}`;
  const agent = {
    id: agentId,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  agents.set(agentId, agent);
  res.json({ success: true, data: { agentId, createdAt: agent.createdAt } });
});

router.post('/:agentId/chat', async (req, res) => {
  const agent = agents.get(req.params.agentId);
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

  const { message, conversationId, context } = req.body;
  const convId = conversationId || `conv_${Date.now()}`;

  // Get or create conversation history
  let history = conversations.get(convId) || [];
  history.push({ role: 'user', content: message });

  try {
    let response: string;
    let tokensUsed = 0;

    if (agent.model?.startsWith('claude')) {
      const result = await anthropic.messages.create({
        model: agent.model || 'claude-3-sonnet-20240229',
        max_tokens: agent.maxTokens || 2000,
        temperature: agent.temperature || 0.7,
        system: agent.systemPrompt || 'You are a helpful assistant.',
        messages: history.map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      });
      response = result.content[0].type === 'text' ? result.content[0].text : '';
      tokensUsed = result.usage.input_tokens + result.usage.output_tokens;
    } else {
      const result = await openai.chat.completions.create({
        model: agent.model || 'gpt-4o',
        max_tokens: agent.maxTokens || 2000,
        temperature: agent.temperature || 0.7,
        messages: [
          { role: 'system', content: agent.systemPrompt || 'You are a helpful assistant.' },
          ...history.map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        ],
      });
      response = result.choices[0].message.content || '';
      tokensUsed = result.usage?.total_tokens || 0;
    }

    history.push({ role: 'assistant', content: response });

    // Trim history if too long
    if (history.length > (agent.memory?.maxMessages || 20) * 2) {
      history = history.slice(-(agent.memory?.maxMessages || 20) * 2);
    }

    conversations.set(convId, history);

    res.json({
      success: true,
      data: { response, tokens: tokensUsed, conversationId: convId },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:agentId/tools', (req, res) => {
  const agent = agents.get(req.params.agentId);
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

  const toolId = `tool_${Date.now()}`;
  const tool = { id: toolId, ...req.body, createdAt: new Date().toISOString() };
  agent.tools = agent.tools || [];
  agent.tools.push(tool);

  res.json({ success: true, data: { toolId, status: 'active' } });
});

router.get('/:agentId/memory', (req, res) => {
  const agent = agents.get(req.params.agentId);
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

  const type = req.query.type as string || 'short-term';
  const limit = parseInt(req.query.limit as string) || 50;

  // Aggregate all conversations for this agent
  const allMessages: any[] = [];
  conversations.forEach((history, convId) => {
    allMessages.push(...history.map((h: any) => ({ ...h, conversationId: convId })));
  });

  res.json({
    success: true,
    data: {
      memories: allMessages.slice(-limit),
      metadata: { type, count: allMessages.length },
    },
  });
});

export default router;
