type MediaBase = {
    duration: string;
    id: string;
    seconds: number;
    title: string;
};

// Confirmed 
type MediaYT = {
    type: "yt";
    meta: {};
}
type MediaFI = {
    type: "fi";
    meta: {
        codec: string;
        bitrate: number;
    };
};
type MediaCM = {
    type: "cm";
    meta: {
        textTracks: Array<any>;
        direct: {
            [quality: number]: Array<{
                contentType: string;
                link: string;
                quality: number;
            }>
        };
    };
};
type MediaPT = {
    type: "pt";
    meta: {
        embed: {
            domain: string;
            onlyLong: boolean;
            short: string;
            tag: string,
            uuid: string;
        };
    };
};

// Guesswork
type MediaCU = {
    type: "cu";
    meta: {
        embed: {
            src: string;
        }
    };
};
type MediaOther = {
    type: "yt" | "vi" | "dm" | "sc" | "li" | "tw" | "rt" | "gd" | "hl" | "sb" | "tc" | "bc" | "bn" | "od" | "nv";
};
type MediaOtherV1 = {
    type: "us" | "hb";
}

export type Media = MediaBase & (MediaYT | MediaFI | MediaCM | MediaPT | MediaCU | MediaOther | MediaOtherV1);
