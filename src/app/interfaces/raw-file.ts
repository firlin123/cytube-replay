export interface RawFile {
    name: string;
    path: string;
    getString: () => Promise<string>;
}
