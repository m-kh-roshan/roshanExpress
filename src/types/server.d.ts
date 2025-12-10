declare module "http" {
    interface IncomingMessage{
        user: {
            id: number,
            username: string
        },
        name: string
    }
}