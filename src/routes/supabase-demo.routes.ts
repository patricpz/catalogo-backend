import { Router } from 'express';
import { DemoNoteController } from '../controllers/demo-note.controller.js';

const router = Router();
const controller = new DemoNoteController();

/** CRUD de exemplo na tabela `demo_notes` (Supabase). */
router.get('/demo-notes', controller.list);
router.get('/demo-notes/:id', controller.getOne);
router.post('/demo-notes', controller.create);
router.patch('/demo-notes/:id', controller.update);
router.delete('/demo-notes/:id', controller.remove);

export { router as supabaseDemoRouter };
