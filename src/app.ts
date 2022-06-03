import 'dotenv/config';
import express, { ErrorRequestHandler, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes/rota'


const app =  express();

app.use(cors());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);
app.use((req:Request, res:Response)=>{
    res.status(404);
    res.json({error: 'Endpoint não encontrado.'});
});
export default app;