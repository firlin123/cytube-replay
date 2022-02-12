export type Poll = { 
    title: string; 
    options: Array<string>; 
    counts: Array<number>; 
    initiator: string; 
    timestamp: number; 
};
