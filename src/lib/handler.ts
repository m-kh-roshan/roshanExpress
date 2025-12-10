import type { IncomingMessage, ServerResponse } from "http";
import type { Handler } from "./roshanExpress.js";

export class Handle {
    protected _handle(...handlers: Handler[]) {
        const handling = async (req: IncomingMessage, res:ServerResponse) => {
            const run = async (index: number): Promise<void> => {
            const layer = handlers[index];
            if(!layer) return;
            if(res.writableEnded) return;
            try {
                await layer(req, res, async () => run(index + 1));
            } catch (error) {
                console.log("Handler&Middileware Error: ", error);
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end("Internal server Error!!!");
                }
            }
        } 
        run(0);
        }
        return handling;
    }
}