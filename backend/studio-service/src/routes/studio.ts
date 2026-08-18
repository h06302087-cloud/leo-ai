import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Type Definitions
interface Project {
  id: string;
  name: string;
  description?: string;
  template?: string;
  createdAt: string;
  status: 'active' | 'archived';
  pages: any[];
  workflows: any[];
}

// Validation Schemas
const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  template: z.string().optional(),
});

const pageSchema = z.object({
  name: z.string().min(1).max(100),
  components: z.array(z.record(z.any())).optional(),
  layout: z.record(z.any()).optional(),
});

// In-memory store (TODO: Replace with Firestore)
const projects = new Map<string, Project>();

/**
 * POST /api/studio/projects
 * Create a new project
 */
router.post('/projects', (req: Request, res: Response) => {
  try {
    const result = projectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.flatten() });
    }

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const project: Project = {
      id: projectId,
      ...result.data,
      createdAt: new Date().toISOString(),
      status: 'active',
      pages: [],
      workflows: [],
    };

    projects.set(projectId, project);
    res.status(201).json({ success: true, data: { projectId, createdAt: project.createdAt } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/studio/projects/:projectId
 * Retrieve project details
 */
router.get('/projects/:projectId', (req: Request, res: Response) => {
  try {
    const project = projects.get(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/studio/projects/:projectId/pages/:pageId
 * Create or update a page within a project
 */
router.put('/projects/:projectId/pages/:pageId', (req: Request, res: Response) => {
  try {
    const project = projects.get(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const validatedData = pageSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ success: false, error: validatedData.error.flatten() });
    }

    const pageIndex = project.pages.findIndex((p: any) => p.id === req.params.pageId);
    const pageData = { id: req.params.pageId, ...validatedData.data, updatedAt: new Date().toISOString() };

    if (pageIndex === -1) {
      project.pages.push(pageData);
    } else {
      project.pages[pageIndex] = pageData;
    }

    res.status(200).json({ success: true, data: { pageId: req.params.pageId, updatedAt: pageData.updatedAt } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/studio/components/preview
 * Generate a preview of a component tree
 */
router.post('/components/preview', (req: Request, res: Response) => {
  try {
    const { componentTree } = req.body;
    if (!componentTree) {
      return res.status(400).json({ success: false, error: 'componentTree is required' });
    }

    // TODO: Implement actual preview generation
    const html = `<div class="component-preview">${componentTree?.type || 'component'}</div>`;

    res.json({ success: true, data: { html, errors: [] } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/studio/bind-data
 * Create a data binding
 */
router.post('/bind-data', (req: Request, res: Response) => {
  try {
    const { sourceField, targetField, transformFn } = req.body;
    if (!sourceField || !targetField) {
      return res.status(400).json({ success: false, error: 'sourceField and targetField are required' });
    }

    const bindingId = `bind_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    res.status(201).json({ success: true, data: { bindingId, status: 'active' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
