import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  template: z.string().optional(),
});

// In-memory store (replace with Firestore in production)
const projects = new Map();

router.post('/projects', (req, res) => {
  const result = projectSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.message });
  }
  const projectId = `proj_${Date.now()}`;
  const project = {
    id: projectId,
    ...result.data,
    createdAt: new Date().toISOString(),
    status: 'active',
    pages: [],
    workflows: [],
  };
  projects.set(projectId, project);
  res.json({ success: true, data: { projectId, createdAt: project.createdAt, status: project.status } });
});

router.get('/projects/:projectId', (req, res) => {
  const project = projects.get(req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, data: project });
});

router.put('/projects/:projectId/pages/:pageId', (req, res) => {
  const project = projects.get(req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  const pageIndex = project.pages.findIndex((p: any) => p.id === req.params.pageId);
  if (pageIndex === -1) {
    project.pages.push({ id: req.params.pageId, ...req.body, updatedAt: new Date().toISOString() });
  } else {
    project.pages[pageIndex] = { ...project.pages[pageIndex], ...req.body, updatedAt: new Date().toISOString() };
  }
  res.json({ success: true, data: { pageId: req.params.pageId, updatedAt: new Date().toISOString() } });
});

router.post('/components/preview', (req, res) => {
  const { componentTree } = req.body;
  // Simplified preview generation
  res.json({ success: true, data: { html: `<div>Preview of ${componentTree?.type || 'component'}</div>`, errors: [] } });
});

router.post('/bind-data', (req, res) => {
  const bindingId = `bind_${Date.now()}`;
  res.json({ success: true, data: { bindingId, status: 'active' } });
});

export default router;
