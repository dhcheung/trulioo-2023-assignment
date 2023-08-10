import Router from 'express'
import loginRoutes from './login-routes';

const router = Router()

// Add other routes here
router.use('/login', loginRoutes)

export default router;