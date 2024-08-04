export declare const lucia: any;
declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}
interface DatabaseUserAttributes {
    username: string;
}
export declare class LuciaService {
    lucia: any;
    constructor();
}
export {};
