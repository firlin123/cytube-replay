export type CustomMediaManifest = {
    duration: number;
    sources: Array<{
        contentType: string;
        quality: number;
        url: string;
    }>;
    textTracks: Array<any>;
    title: string;
};
