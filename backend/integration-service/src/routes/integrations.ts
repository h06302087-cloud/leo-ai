import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Type Definitions
interface Integration {
  id: string;
  name: string;
  provider: string;
  config: Record<string, any>;
  createdAt: string;
  status: 'active' | 'inactive' | 'error';
}

// Validation Schemas
const integrationSchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.enum(['slack', 'github', 'stripe', 'sendgrid', 'twilio']),
  config: z.record(z.any()),
});

// In-memory store (TODO: Replace with Firestore)
const integrations = new Map<string, Integration>();

/**
 * POST /api/integrations
 * Create a new integration
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const result = integrationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.flatten() });
    }

    const integrationId = `int_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const integration: Integration = {
      id: integrationId,
      ...result.data,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    integrations.set(integrationId, integration);
    res.status(201).json({ success: true, data: { integrationId, status: 'active' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/integrations/:integrationId
 * Retrieve integration details
 */
router.get('/:integrationId', (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.integrationId);
    if (!integration) {
      return res.status(404).json({ success: false, error: 'Integration not found' });
    }
    // Don't expose sensitive config in response
    const { config, ...safeData } = integration;
    res.json({ success: true, data: safeData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/integrations/:integrationId/test
 * Test if an integration is working
 */
router.post('/:integrationId/test', (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.integrationId);
    if (!integration) {
      return res.status(404).json({ success: false, error: 'Integration not found' });
    }

    // TODO: Implement actual provider health checks
    res.json({ success: true, data: { status: 'connected', provider: integration.provider } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/integrations
 * List all integrations
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const allIntegrations = Array.from(integrations.values()).map(({ config, ...safe }) => safe);
    res.json({ success: true, data: allIntegrations, count: allIntegrations.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
