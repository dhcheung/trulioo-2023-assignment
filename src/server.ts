import * as dotenv from 'dotenv';
// load .env.local variables if exists
dotenv.config(
    {
        path: "./.env.local"
    }
);

import app from './app';

const port = process.env.PORT || '3000'

app.listen(port, () => {
    console.log(`[Server]: I am running at https://localhost:${port}`);
});