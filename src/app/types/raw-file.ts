export type RawFile = {
    name: string;
    path: string;
    getString: () => Promise<string>;
}
