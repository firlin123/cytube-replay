type EmitBase = {
    type: 'replayEmit';
    callbackId?: number;
};

type EmitNamePayload = {
    key: "joinChannel" | "clonePlaylist" | "login";
    payload: {
        name: string;
    };
};

type EmitChatMsg = {
    key: "chatMsg";
    payload: {
        meta: {};
        msg: string;
    };
};

type EmitNewPoll = {
    key: "newPoll";
    payload: {
        obscured: boolean;
        opts: Array<string>;
        retainVotes: true;
        timeout: number;
        title: string;
    };
};

type EmitSearchMedia = {
    key: "searchMedia";
    payload: {
        query: string;
        source: "yt";
    };
};

type EmitQueue = {
    key: "queue";
    payload: {
        duration: undefined;
        id: "xO6f2ykW84A";
        pos: "next" | "end";
        temp: boolean;
    } & ({
        title: undefined;
        type: "yt" | "cm" | "pt" | "vi" | "dm" | "sc" | "li" | "tw" | "rt" | "gd" | "hl" | "sb" | "tc" | "bc" | "bn" | "od" | "nv" | "us" | "hb";
    } | {
        title: string;
        type: "fi" | "cu";
    });
};

type EmitNoPayload = {
    key: "initUserPLCallbacks" | "playerReady" | "requestPlaylist" | "clearPlaylist" | "shufflePlaylist" | "togglePlaylistLock" | "voteskip"
}

export type Emit = EmitBase & (EmitNamePayload | EmitChatMsg | EmitNewPoll | EmitSearchMedia | EmitQueue | EmitNoPayload);