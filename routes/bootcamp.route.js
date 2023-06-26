import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { addBootcamp, getBootcamps, updateBootcamp } from '../controller/bootcamp.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/checkRole.js';

const router = Router();

router.get('/', authenticateUser, checkRole("admin"), getBootcamps);
router.post('/create', authenticateUser, checkRole("admin", "publisher"), upload.single('photo'), addBootcamp);
router.patch('/update/:id', authenticateUser, checkRole("admin", "publisher"), upload.single("photo"), updateBootcamp)

export default router;