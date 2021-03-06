import { ReplayEvent } from "../replay/replay-event";

export type SkipState = {
    connectedChanged: boolean;
    rankChanged: boolean;
    premissionsChanged: boolean;
    playlistLockedChanged: boolean;
    emotesChanged: boolean;
    channelNotRegisteredChanged: boolean;
    drinkCountChanged: boolean;
    channelCSSJSChanged: boolean;
    motdChanged: boolean;
    chanelOptsChanged: boolean;
    playlistMetaChanged: boolean;
    playlistChanged: boolean;
    userlistChanged: boolean;
    usercountChanged: boolean;
    loginChanged: boolean;
    chatMessagesCnt: number;
    currentChanged: boolean;
    currentMediaChanged: boolean;
    currentMediaUpdated: boolean;
    listPlaylistsChanged: boolean;
    voteskipChanged: boolean;
    pollsChanged: Set<number>;
    pollsNew: Set<number>;
    pollsUpdated: Set<number>;
    pollsClosed: Set<number>;
    announcementChanged: boolean;
    leaderChanged: boolean;
    errorMsgChanged: boolean;
    kickedChanged: boolean;
    chatCleared: number;
    unknownEvents: Array<ReplayEvent>;
};
