export type Media = {
    duration: string;
    id: string;
    meta: {
        textTracks: Array<any>;
        direct: {
            [key: number]: Array<{
                contentType: string;
                link: string;
                quality: number;
            }>
        };
    };
    seconds: number;
    title: string;
    type: string;
};
