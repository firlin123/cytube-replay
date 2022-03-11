import { ReplayEvent } from "../types/replay/replay-event";
import { ChannelCSSJS } from "../types/replay-state/channel-cssjs";
import { ChannelOpts } from "../types/replay-state/channel-opts";
import { ChatMsg } from "../types/replay-state/chat-msg";
import { EvDelete } from "../types/replay-state/ev-delete";
import { Emote } from "../types/replay-state/emote";
import { ListPlaylistsItem } from "../types/replay-state/list-playlists-item";
import { Login } from "../types/replay-state/login";
import { MediaState } from "../types/replay-state/media-state";
import { Permissions } from "../types/replay-state/permissions";
import { PlaylistItem } from "../types/replay-state/playlist-item";
import { PlaylistMeta } from "../types/replay-state/playlist-meta";
import { User } from "../types/replay-state/user";
import { EvMediaUpdate } from "../types/replay-state/ev-media-update";
import { EvSetUserMeta } from "../types/replay-state/ev-set-user-meta";
import { EvSetAFK } from "../types/replay-state/ev-set-afk";
import { EvSetUserRank } from "../types/replay-state/ev-set-user-rank";
import { EvUserLeave } from "../types/replay-state/ev-user-leave";
import { Poll } from "../types/replay-state/poll";
import { EvQueue } from "../types/replay-state/ev-queue";
import { Announcement } from "../types/replay-state/announcement";
import { EvMoveVideo } from "../types/replay-state/ev-move-video";
import { EvRemoveEmote } from "../types/replay-state/ev-remove-emote";
import { EvSetUserProfile } from "../types/replay-state/ev-set-user-profile";
import { Kicked } from "../types/replay-state/kicked";
import { Voteskip } from "../types/replay-state/voteskip";
import { EvSetTemp } from "../types/replay-state/ev-set-temp";
import { ReplayFile } from "../types/replay/replay-file";
import { NavbarLoading } from "./navbar-loading";
import { CustomMediaManifest } from "../types/replay-state/custom-media-manifest";
import { SkipState } from "../types/replay-state/skip-state";
import { EvRenameEmote } from "../types/replay-state/ev-rename-emote";
import { ChatCleared } from "../types/replay-state/chat-cleared";
import { ErrorMsg } from "../types/replay-state/error-msg";

type CachedResponse = {
    ok: boolean;
    cachedJson: any;
}

export class ReplayState {
    static cachedResponses: Record<string, CachedResponse> = {};
    private connected: boolean;
    private rank: number;
    private premissions: Permissions;
    private playlistLocked: boolean;
    private emotes: Array<Emote>;
    private drinkCount: number;
    private channelCSSJS: ChannelCSSJS;
    private motd: string;
    private chanelOpts: ChannelOpts;
    private playlistMeta: PlaylistMeta;
    private playlist: Array<PlaylistItem>;
    private userlist: Array<User>;
    private usercount: number;
    private login?: Login;
    private chat: Array<ChatMsg>;
    private current?: number;
    private currentMedia?: MediaState;
    private listPlaylists: Array<ListPlaylistsItem>;
    private polls: Array<Poll>;
    private pollsClosed: Array<boolean>;
    private announcement?: Announcement;
    private leader?: string;
    private kicked?: Kicked;
    private voteskip?: Voteskip;
    private skipStates: Array<SkipState>;
    private chatCleared?: ChatCleared;
    private channelNotRegistered?: boolean;
    private errorMsg?: ErrorMsg;
    public constructor() {
        this.connected = false;
        this.rank = -1;
        this.premissions = {
            addnontemp: 0, chat: 0, chatclear: 2, deletefromchannellib: 2, drink: 0, exceedmaxitems: 2, exceedmaxlength: 0,
            leaderctl: 0, oplaylistadd: -1, oplaylistaddlist: 0, oplaylistdelete: 0, oplaylistjump: 0, oplaylistmove: 0,
            oplaylistnext: 0, playlistadd: -1, playlistaddcustom: 0, playlistaddlist: 0, playlistaddlive: 0, playlistclear: 0,
            playlistdelete: 0, playlistjump: 0, playlistlock: 2, playlistmove: 0, playlistnext: 0, playlistshuffle: 0,
            pollctl: 0, pollvote: -1, seeplaylist: -1, settemp: 0, viewhiddenpoll: 1.5, viewvoteskip: 1.5, voteskip: -1
        }
        this.playlistLocked = false;
        this.emotes = [];
        this.drinkCount = 0;
        this.channelCSSJS = { css: "", cssHash: "1B2M2Y8AsgTpgAmY7PhCfg==", js: "", jsHash: "1B2M2Y8AsgTpgAmY7PhCfg==" };
        this.motd = "";
        this.chanelOpts = {
            afk_timeout: 600, allow_ascii_control: false, allow_dupes: false, allow_voteskip: true, block_anonymous_users: false,
            chat_antiflood: false, chat_antiflood_params: { burst: 4, sustained: 1, cooldown: 4 }, enable_link_regex: true,
            externalcss: "", externaljs: "", maxlength: 0, new_user_chat_delay: 0, new_user_chat_link_delay: 0, pagetitle: "replay",
            password: false, playlist_max_duration_per_user: 0, playlist_max_per_user: 0, show_public: false, torbanned: false
        };
        this.playlistMeta = { count: 0, rawTime: 0, time: "00:00" };
        this.playlist = [];
        this.userlist = [];
        this.usercount = 0;
        this.chat = [];
        this.listPlaylists = [];
        this.polls = [];
        this.pollsClosed = [];
        this.skipStates = [];
    }
    public processEvent(event: ReplayEvent): void {
        let data = event.data[0];

        try {
            switch (event.type) {
                case 'connect':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.connectedChanged = true; });
                    this.connected = true;
                    break;
                case 'rank':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.rankChanged = true; });
                    this.rank = data;
                    break;
                case 'setPermissions':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.premissionsChanged = true; });
                    this.premissions = data as Permissions;
                    break;
                case 'setPlaylistLocked':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistLockedChanged = true; });
                    this.playlistLocked = data as boolean;
                    break;
                case 'emoteList':
                    if (localStorage['firlin123Debug1'] === 'true') debugger;
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.emotesChanged = true; });
                    this.emotes = data as Array<Emote>;
                    break;
                case 'drinkCount':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.drinkCountChanged = true; });
                    this.drinkCount = data as number;
                    break;
                case 'channelCSSJS':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.channelCSSJSChanged = true; });
                    this.channelCSSJS = data as ChannelCSSJS;
                    break;
                case 'setMotd':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.motdChanged = true; });
                    this.motd = data as string;
                    break;
                case 'channelOpts':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.chanelOptsChanged = true; });
                    this.chanelOpts = data as ChannelOpts;
                    break;
                case 'setPlaylistMeta':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistMetaChanged = true; });
                    this.playlistMeta = data as PlaylistMeta;
                    break;
                case 'playlist':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                    this.playlist = data as Array<PlaylistItem>;
                    break;
                case 'userlist':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.userlistChanged = true; });
                    this.userlist = data as Array<User>;
                    break;
                case 'usercount':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.usercountChanged = true; });
                    this.usercount = data as number;
                    break;
                case 'login':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.loginChanged = true; });
                    this.login = data as Login;
                    break;
                case 'chatMsg':
                    this.skipStates.forEach((skipState: SkipState): void => {
                        skipState.chatMessagesCnt++;
                        if (skipState.chatCleared != -1)
                            skipState.chatCleared++;
                    });
                    if (this.chat.length > 20) this.chat.splice(0, 1);
                    this.chat.push(data as ChatMsg);
                    break;
                case 'setCurrent':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.currentChanged = true; });
                    this.current = data as number;
                    break;
                case 'changeMedia':
                    this.skipStates.forEach((skipState: SkipState): void => {
                        skipState.currentMediaChanged = true;
                        skipState.currentMediaUpdated = true;
                    });
                    this.currentMedia = data as MediaState;
                    break;
                case 'listPlaylists':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.listPlaylistsChanged = true; });
                    this.listPlaylists = data as Array<ListPlaylistsItem>;
                    break;
                case 'delete':
                    let evDelete: EvDelete = data as EvDelete;
                    let deleteIdx: number = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evDelete.uid);
                    if (deleteIdx !== -1) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                        this.playlist.splice(deleteIdx, 1);
                    }
                    break;
                case 'mediaUpdate':
                    let evMediaUpdate: EvMediaUpdate = data as EvMediaUpdate;
                    if (this.currentMedia != null) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.currentMediaUpdated = true; });
                        this.currentMedia.paused = evMediaUpdate.paused;
                        this.currentMedia.currentTime = evMediaUpdate.currentTime;
                    }
                    break;
                case 'addUser':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.userlistChanged = true; });
                    let addUser: User = data as User;
                    let prevUserIdx: number = this.userlist.findIndex((u: User) => u.name.toLowerCase() === addUser.name.toLowerCase());
                    if (prevUserIdx !== -1) {
                        this.userlist[prevUserIdx] = addUser;
                    }
                    else {
                        this.userlist.push(addUser);
                    }
                    break;
                case 'setUserMeta':
                    let evSetUserMeta: EvSetUserMeta = data as EvSetUserMeta;
                    let setUserMeta: User | undefined = this.userlist.find((u: User) => u.name.toLowerCase() === evSetUserMeta.name.toLowerCase());
                    if (setUserMeta != null) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.userlistChanged = true; });
                        setUserMeta.meta = evSetUserMeta.meta;
                    }
                    break;
                case 'setAFK':
                    let evSetAFK: EvSetAFK = data as EvSetAFK;
                    let setAFK: User | undefined = this.userlist.find((u: User) => u.name.toLowerCase() === evSetAFK.name.toLowerCase());
                    if (setAFK != null) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.userlistChanged = true; });
                        setAFK.meta.afk = evSetAFK.afk;
                    }
                    break;
                case 'setUserRank':
                    let evSetUserRank: EvSetUserRank = data as EvSetUserRank;
                    let setUserRank: User | undefined = this.userlist.find((u: User) => u.name.toLowerCase() === evSetUserRank.name.toLowerCase());
                    if (setUserRank != null) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.userlistChanged = true; });
                        setUserRank.rank = evSetUserRank.rank;
                    }
                    break;
                case 'userLeave':
                    let evUserLeave: EvUserLeave = data as EvUserLeave;
                    let userLeaveIdx: number = this.userlist.findIndex((u: User) => u.name.toLowerCase() === evUserLeave.name.toLowerCase());
                    if (userLeaveIdx !== -1) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.userlistChanged = true; });
                        this.userlist.splice(userLeaveIdx, 1);
                    }
                    break;
                case 'clearVoteskipVote':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.voteskipChanged = true; });
                    this.voteskip = undefined;
                    break;
                case 'newPoll':
                    this.skipStates.forEach((skipState: SkipState): void => {
                        skipState.pollsChanged.add(this.polls.length);
                        skipState.pollsNew.add(this.polls.length);
                    });
                    this.polls.push(data as Poll);
                    this.pollsClosed.push(false);
                    break;
                case 'updatePoll':
                    if (this.polls.length > 0) {
                        this.skipStates.forEach((skipState: SkipState): void => {
                            skipState.pollsChanged.add(this.polls.length - 1);
                            skipState.pollsUpdated.add(this.polls.length - 1);
                        });
                        this.polls[this.polls.length - 1] = data as Poll;
                    }
                    break;
                case 'queue':
                    let evQueue: EvQueue = data as EvQueue;
                    if (typeof evQueue.after === 'number') {
                        let insertAtIdx: number = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evQueue.after);
                        if (insertAtIdx !== -1) {
                            insertAtIdx++;
                            this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                            this.playlist.splice(insertAtIdx, 0, evQueue.item);
                        }
                    }
                    else if (evQueue.after === 'append') {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                        this.playlist.push(evQueue.item);
                    } else if (evQueue.after === 'prepend') {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                        this.playlist.unshift(evQueue.item);
                    }
                    break;
                case 'closePoll':
                    if (this.pollsClosed.length > 0) {
                        this.skipStates.forEach((skipState: SkipState): void => {
                            skipState.pollsChanged.add(this.polls.length - 1);
                            skipState.pollsClosed.add(this.polls.length - 1);
                        });
                        this.pollsClosed[this.pollsClosed.length - 1] = true;
                    }
                    break;
                case 'announcement':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.announcementChanged = true; });
                    this.announcement = data as Announcement;
                    break;
                case 'disconnect':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.connectedChanged = true; });
                    this.connected = false;
                    break;
                case 'moveVideo':
                    let evMoveVideo: EvMoveVideo = data as EvMoveVideo;
                    let moveFromIdx: number = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evMoveVideo.from);
                    if (moveFromIdx != -1) {
                        let moveItem: PlaylistItem = this.playlist[moveFromIdx];
                        if (typeof evMoveVideo.after === 'number') {
                            let moveToIdx: number = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evMoveVideo.after);
                            if (moveToIdx != -1) {
                                this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                                if (moveFromIdx > moveToIdx) moveToIdx++;
                                this.playlist.splice(moveFromIdx, 1);
                                this.playlist.splice(moveToIdx, 0, moveItem);
                            }
                        }
                        else if (evMoveVideo.after === 'append') {
                            this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                            this.playlist.splice(moveFromIdx, 1);
                            this.playlist.push(moveItem);
                        } else if (evMoveVideo.after === 'prepend') {
                            this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                            this.playlist.splice(moveFromIdx, 1);
                            this.playlist.unshift(moveItem);
                        }
                    }
                    break;
                case 'removeEmote':
                    if (localStorage['firlin123Debug2'] === 'true') debugger;
                    let evRemoveEmote: EvRemoveEmote = data as EvRemoveEmote;
                    let removeEmoteIdx = this.emotes.findIndex((e: Emote) => e.name === evRemoveEmote.name);
                    if (removeEmoteIdx !== -1) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.emotesChanged = true; });
                        this.emotes.splice(removeEmoteIdx, 1);
                    }
                    break;
                case 'updateEmote':
                    if (localStorage['firlin123Debug3'] === 'true') debugger
                    let evUpdateEmote: Emote = data as Emote;
                    let updateEmoteIdx = this.emotes.findIndex((e: Emote) => e.name === evUpdateEmote.name);
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.emotesChanged = true; });
                    if (updateEmoteIdx !== -1) {
                        this.emotes[updateEmoteIdx] = evUpdateEmote;
                    }
                    else {
                        this.emotes.push(evUpdateEmote);
                    }
                    break;
                case 'setLeader':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.leaderChanged = true; });
                    this.leader = data as string;
                    break;
                case 'setUserProfile':
                    let evSetUserProfile: EvSetUserProfile = data as EvSetUserProfile;
                    let setUserProfile: User | undefined = this.userlist.find((u: User) => u.name.toLowerCase() === evSetUserProfile.name.toLowerCase());
                    if (setUserProfile != null) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.userlistChanged = true; });
                        setUserProfile.profile = evSetUserProfile.profile;
                    }
                    break;
                case 'kick':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.kickedChanged = true; });
                    this.kicked = data as Kicked;
                    break;
                case 'partitionChange':
                    console.log('TODO: partitionChange');
                    break;
                case 'voteskip':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.voteskipChanged = true; });
                    this.voteskip = data as Voteskip;
                    break;
                case 'setTemp':
                    let evSetTemp: EvSetTemp = data as EvSetTemp;
                    let setTemp: PlaylistItem | undefined = this.playlist.find((pi: PlaylistItem) => pi.uid === evSetTemp.uid);
                    if (setTemp != null) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.playlistChanged = true; });
                        setTemp.temp = evSetTemp.temp;
                    }
                    break;
                case 'cooldown':
                    // We don't care about cooldowns
                    // Spam all you want its your computer
                    break;
                case 'renameEmote':
                    let evRenameEmote: EvRenameEmote = data as EvRenameEmote;
                    let renameEmoteIdx = this.emotes.findIndex((e: Emote) => e.name === evRenameEmote.old);
                    if (renameEmoteIdx !== -1) {
                        this.skipStates.forEach((skipState: SkipState): void => { skipState.emotesChanged = true; });
                        delete (evRenameEmote as any).old;
                        this.emotes[renameEmoteIdx] = evRenameEmote;
                    }
                    break;
                case 'clearchat':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.chatCleared = 0; });
                    let chatCleared: ChatCleared = data as ChatCleared;
                    this.chatCleared = chatCleared;
                    break;
                case 'channelNotRegistered':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.channelNotRegisteredChanged = true; });
                    this.channelNotRegistered = true;
                    break;
                case 'errorMsg':
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.errorMsgChanged = true; });
                    this.errorMsg = data as ErrorMsg;
                    break;
                case 'snowpityEvent':
                    break;
                case 'queue_history':
                case 'playlist_history':
                case 'setRandomPlay':
                case 'voteup':
                case 'pong':
                    // Todo cytube.xyz 
                    break;
                default:
                    let evCopy: ReplayEvent = JSON.parse(JSON.stringify(event)) as ReplayEvent;
                    this.skipStates.forEach((skipState: SkipState): void => { skipState.unknownEvents.push(evCopy); });
                    if (localStorage.getItem('firlin123Debug')) debugger;
                    break;
            }
        } catch (exc) {
            if (localStorage.getItem('firlin123Debug')) debugger;
        }
    }

    public async prepareFile(file: ReplayFile, loading: NavbarLoading): Promise<ReplayFile> {
        let newFile: ReplayFile = JSON.parse(JSON.stringify(file));
        for (const event of newFile.events) {
            if (event.type === 'changeMedia') {
                let mediaState: MediaState = event.data[0] as MediaState;
                if (mediaState.type === 'cm') {
                    loading.text = mediaState.title;
                    console.log("Loading", mediaState.title, mediaState.id);
                    try {
                        let resp: CachedResponse | Response | null = ReplayState.cachedResponses[mediaState.id];
                        if (resp == null) {
                            resp = await fetch(mediaState.id);
                        }
                        if (resp.ok) {
                            let json: CustomMediaManifest;
                            if ('cachedJson' in resp) {
                                console.log('Using cached ' + mediaState.id);
                                json = resp.cachedJson as CustomMediaManifest;
                            }
                            else {
                                json = await resp.json() as CustomMediaManifest;
                                ReplayState.cachedResponses[mediaState.id] = {
                                    ok: resp.ok,
                                    cachedJson: json
                                }
                            }
                            mediaState.meta.direct = {};
                            for (const source of json.sources) {
                                mediaState.meta.direct[source.quality] = [{
                                    contentType: source.contentType,
                                    link: source.url,
                                    quality: source.quality,

                                }];
                            }
                        }
                        else {
                            ReplayState.cachedResponses[mediaState.id] = {
                                ok: resp.ok,
                                cachedJson: null
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
        return newFile;
    }

    public createSkipState(): SkipState {
        let skipState: SkipState;
        this.skipStates.push(skipState = {
            connectedChanged: false,
            rankChanged: false,
            premissionsChanged: false,
            playlistLockedChanged: false,
            emotesChanged: false,
            channelNotRegisteredChanged: false,
            drinkCountChanged: false,
            channelCSSJSChanged: false,
            motdChanged: false,
            chanelOptsChanged: false,
            playlistMetaChanged: false,
            playlistChanged: false,
            userlistChanged: false,
            usercountChanged: false,
            loginChanged: false,
            chatMessagesCnt: 0,
            currentChanged: false,
            currentMediaChanged: false,
            currentMediaUpdated: false,
            listPlaylistsChanged: false,
            voteskipChanged: false,
            pollsChanged: new Set<number>(),
            pollsNew: new Set<number>(),
            pollsUpdated: new Set<number>(),
            pollsClosed: new Set<number>(),
            announcementChanged: false,
            leaderChanged: false,
            errorMsgChanged: false,
            kickedChanged: false,
            chatCleared: -1,
            unknownEvents: []
        });
        return skipState;
    }

    public getSkipStateEvents(skipState: SkipState): Array<ReplayEvent> {
        if (this.skipStates.includes(skipState)) {
            let events: Array<ReplayEvent> = [];
            if (skipState.rankChanged) {
                events.push(mkev('rank', this.rank));
            }
            if (skipState.premissionsChanged) {
                events.push(mkev('setPermissions', this.premissions));
            }
            if (skipState.playlistLockedChanged) {
                events.push(mkev('setPlaylistLocked', this.playlistLocked));
            }
            if (skipState.emotesChanged) {
                //debugger;
                events.push(mkev('emoteList', this.emotes));
            }
            if (skipState.channelNotRegisteredChanged) {
                events.push(mkev('channelNotRegistered'));
            }
            if (skipState.drinkCountChanged) {
                events.push(mkev('drinkCount', this.drinkCount));
            }
            if (skipState.channelCSSJSChanged) {
                events.push(mkev('channelCSSJS', this.channelCSSJS));
            }
            if (skipState.motdChanged) {
                events.push(mkev('setMotd', this.motd));
            }
            if (skipState.chanelOptsChanged) {
                events.push(mkev('channelOpts', this.chanelOpts));
            }
            if (skipState.playlistMetaChanged) {
                events.push(mkev('setPlaylistMeta', this.playlistMeta));
            }
            if (skipState.playlistChanged) {
                events.push(mkev('playlist', this.playlist));
            }
            if (skipState.userlistChanged) {
                events.push(mkev('userlist', this.userlist));
            }
            if (skipState.usercountChanged) {
                events.push(mkev('usercount', this.usercount));
            }
            if (skipState.loginChanged) {
                events.push(mkev('login', this.login));
            }
            if (skipState.chatCleared != -1) {
                events.push(mkev('chatCleared', this.chatCleared));
            }
            if (skipState.chatMessagesCnt > 0) {
                let messagesCnt: number = skipState.chatMessagesCnt > 20 ? 20 : skipState.chatMessagesCnt;
                let skippedCnt: number = skipState.chatMessagesCnt - messagesCnt;
                let messages: Array<ChatMsg> = this.chat.slice(this.chat.length - messagesCnt, messagesCnt);
                for (const message of messages) {
                    events.push(mkev('chatMsg', message));
                }
                if (skippedCnt > 0) {
                    let time: number = messages[messages.length - 1].time + 1;
                    let skippedMsg: ChatMsg = {
                        username: 'CyTube Replay',
                        msg: '<code>Skipped ' + skippedCnt + ' messages</code>',
                        meta: {},
                        time: time
                    };
                    events.push(mkev('chatMsg', skippedMsg));
                }
            }
            if (skipState.currentChanged) {
                events.push(mkev('setCurrent', this.current));
            }
            if (skipState.currentMediaChanged) {
                events.push(mkev('changeMedia', this.currentMedia));
            }
            if (skipState.currentMediaUpdated) {
                events.push(mkev('mediaUpdate', this.currentMedia));
            }
            if (skipState.listPlaylistsChanged) {
                events.push(mkev('listPlaylists', this.listPlaylists));
            }
            if (skipState.voteskipChanged) {
                events.push(mkev((this.voteskip != null ? 'voteskip' : 'clearVoteskipVote'), this.voteskip));
            }
            for (let pollNumber of skipState.pollsChanged) {
                let poll: Poll = this.polls[pollNumber];
                if (poll != null) {
                    if (skipState.pollsNew.has(pollNumber)) {
                        events.push(mkev('newPoll', poll));
                    }
                    if (skipState.pollsUpdated.has(pollNumber)) {
                        events.push(mkev('updatePoll', poll));
                    }
                    if (skipState.pollsClosed.has(pollNumber)) {
                        events.push(mkev('closePoll'));
                    }
                }
            }
            if (skipState.announcementChanged) {
                events.push(mkev('announcement', this.announcement));
            }
            if (skipState.leaderChanged) {
                events.push(mkev('setLeader', this.leader));
            }
            if (skipState.errorMsgChanged) {
                events.push(mkev('errorMsg', this.errorMsg));
            }
            for (let unknownEvent of skipState.unknownEvents) {
                if (unknownEvent.type !== 'unknownEvent') {
                    events.push(unknownEvent);
                }
            }
            if (skipState.kickedChanged) {
                events.push(mkev('kick', this.kicked));
            }
            if (skipState.connectedChanged) {
                if (this.connected) {
                    events.unshift(mkev('connect'));
                }
                else {
                    events.push(mkev('disconnect'))
                }

            }
            return events;
        }
        else {
            return [];
        }
    }

    public removeSkipState(skipState: SkipState): void {
        let skipStateIndex: number = this.skipStates.indexOf(skipState);
        if (skipStateIndex !== -1) {
            this.skipStates.splice(skipStateIndex, 1);
        }
    }

    public requestPlaylist(): Array<ReplayEvent> {
        return [
            mkev('setPlaylistMeta', this.playlistMeta),
            mkev('playlist', this.playlist),
            mkev('setCurrent', this.current == null ? 0 : this.current)
        ];
    }

    public playerReady(): Array<ReplayEvent> {
        if (this.currentMedia != null && this.current != null)
            return [
                mkev('setCurrent', this.current),
                mkev('changeMedia', this.currentMedia)
            ];
        else
            return [];
    }
}

function mkev(type: string, data?: any): ReplayEvent {
    return { time: 0, type, data: (data != null ? [data] : []) }
}