import { signin, signout, register } from '../controllers/login-controller'
import Router from 'express'
import { registerValidations, signinValidations, signoutValidations } from '../validations/login-validations';

const router = Router()

router.post('/signin', signinValidations, signin)
router.post('/signout', signoutValidations, signout)
router.post('/register', registerValidations, register)

export default router;