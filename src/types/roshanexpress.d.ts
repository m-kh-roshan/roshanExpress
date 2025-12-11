export type Handler = (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
) => Promise<void> | void;

export type LoggerOption = {
    method?: string,
    url?: string,
    statusCode?: string
};

export type RoshanExpressOptions = {
    logger?: Logger
}

export type Logger = boolean | LoggerOption;

export interface IRouter {
    get: (url: string, ...handlers: Handler[]) => void;
    post: (url: string, ...handlers: Handler[]) => void;
    delete: (url: string, ...handlers: Handler[]) => void;
    put: (url: string, ...handlers: Handler[]) => void;
    patch: (url: string, ...handlers: Handler[]) => void;
}