import bodyParser from 'body-parser';
import cors from 'cors';
import express, {Express, Request, Response, NextFunction} from 'express';
import apiRoutes from './routes/routes';

const app: Express = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN
}
app.use(cors(corsOptions));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err) {
        console.log(err);
        // Log error and hide internal errors and expose just the error message to clients
        res.status(500).send(
            {
                'success': false,
                'errorMessage': err.message
            }
        )
        return;
    }
    next();
});

export default app;