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

export class ReplayState {
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
    private announcement?: Announcement;
    private leader?: string;
    private kicked?: Kicked;
    private voteskip?: Voteskip; 
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
    }
    public processEvent(event: ReplayEvent): Array<ReplayEvent> {
        //Old caputres fixes;
        let events: Array<ReplayEvent> = [];
        if (event == null) {
            event = { type: 'unknownEvent', time: 0, data: [] };
        }
        events.push(event);
        if (event.data == null) {
            event.data = [];
        }
        if (typeof event.type !== 'string') {
            event.type = 'unknownEvent';
        }
        if (!(event.data instanceof Array)) {
            event.data = [event.data];
        }
        let data = event.data[0];

        try {
            switch (event.type) {
                case 'connect':
                    this.connected = true;
                    break;
                case 'rank':
                    this.rank = data;
                    break;
                case 'setPermissions':
                    this.premissions = data as Permissions;
                    break;
                case 'setPlaylistLocked':
                    this.playlistLocked = data as boolean;
                    break;
                case 'emoteList':
                    this.emotes = data as Array<Emote>;
                    break;
                case 'drinkCount':
                    this.drinkCount = data as number;
                    break;
                case 'channelCSSJS':
                    this.channelCSSJS = data as ChannelCSSJS;
                    break;
                case 'setMotd':
                    this.motd = data as string;
                    break;
                case 'channelOpts':
                    this.chanelOpts = data as ChannelOpts;
                    break;
                case 'setPlaylistMeta':
                    this.playlistMeta = data as PlaylistMeta;
                    break;
                case 'playlist':
                    this.playlist = data as Array<PlaylistItem>;
                    break;
                case 'userlist':
                    this.userlist = data as Array<User>;
                    break;
                case 'usercount':
                    this.usercount = data as number;
                    break;
                case 'login':
                    this.login = data as Login;
                    break;
                case 'chatMsg':
                    if(this.chat.length > 20) this.chat.splice(0, 1);
                    this.chat.push(data as ChatMsg);
                    break;
                case 'setCurrent':
                    this.current = data as number;
                    break;
                case 'changeMedia':
                    this.currentMedia = data as MediaState;
                    break;
                case 'listPlaylists':
                    this.listPlaylists = data as Array<ListPlaylistsItem>;
                    break;
                case 'delete':
                    let evDelete: EvDelete = data as EvDelete;
                    let deleteIdx: number = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evDelete.uid);
                    if (deleteIdx !== -1) {
                        this.playlist.splice(deleteIdx, 1);
                    }
                    break;
                case 'mediaUpdate':
                    let evMediaUpdate: EvMediaUpdate = data as EvMediaUpdate;
                    if (this.currentMedia != null) {
                        this.currentMedia.paused = evMediaUpdate.paused;
                        this.currentMedia.currentTime = evMediaUpdate.currentTime;
                    }
                    break;
                case 'addUser':
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
                        setUserMeta.meta = evSetUserMeta.meta;
                    }
                    break;
                case 'setAFK':
                    let evSetAFK: EvSetAFK = data as EvSetAFK;
                    let setAFK: User | undefined = this.userlist.find((u: User) => u.name.toLowerCase() === evSetAFK.name.toLowerCase());
                    if (setAFK != null) {
                        setAFK.meta.afk = evSetAFK.afk;
                    }
                    break;
                case 'setUserRank':
                    let evSetUserRank: EvSetUserRank = data as EvSetUserRank;
                    let setUserRank: User | undefined = this.userlist.find((u: User) => u.name.toLowerCase() === evSetUserRank.name.toLowerCase());
                    if (setUserRank != null) {
                        setUserRank.rank = evSetUserRank.rank;
                    }
                    break;
                case 'userLeave':
                    let evUserLeave: EvUserLeave = data as EvUserLeave;
                    let userLeaveIdx: number = this.userlist.findIndex((u: User) => u.name.toLowerCase() === evUserLeave.name.toLowerCase());
                    if (userLeaveIdx !== -1) {
                        this.userlist.splice(userLeaveIdx, 1);
                    }
                    break;
                case 'clearVoteskipVote':
                    this.voteskip = undefined;
                    break;
                case 'newPoll':
                    this.polls.push(data as Poll);
                    break;
                case 'updatePoll':
                    if (this.polls.length > 0) {
                        this.polls[this.polls.length - 1] = data as Poll;
                    }
                    break;
                case 'queue':
                    let evQueue: EvQueue = data as EvQueue;
                    let insertAtIdx: number | undefined = undefined;
                    if (typeof evQueue.after === 'number') {
                        insertAtIdx = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evQueue.after) + 1;
                    }
                    else if (evQueue.after === 'append') {
                        insertAtIdx = this.playlist.length;
                    } else if (evQueue.after === 'prepend') {
                        insertAtIdx = 0;
                    }
                    if (insertAtIdx != null) {
                        this.playlist.splice(insertAtIdx, 0, evQueue.item);
                    }
                    break;
                case 'closePoll':
                    console.log("TODO: closePoll");
                    break;
                case 'announcement':
                    this.announcement = data as Announcement;
                    break;
                case 'disconnect':
                    this.connected = false;
                    break;
                case 'moveVideo':
                    let evMoveVideo: EvMoveVideo = data as EvMoveVideo;
                    let moveFromIdx: number = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evMoveVideo.from);
                    let moveToIdx: number | undefined = undefined;
                    if (typeof evMoveVideo.after === 'number') {
                        moveToIdx = this.playlist.findIndex((pi: PlaylistItem) => pi.uid === evMoveVideo.after) + 1;
                    }
                    else if (evMoveVideo.after === 'append') {
                        moveToIdx = this.playlist.length;
                    } else if (evMoveVideo.after === 'prepend') {
                        moveToIdx = 0;
                    }
                    if (moveToIdx != null && moveFromIdx != null && moveFromIdx !== -1) {
                        this.playlist.splice(moveToIdx, 0, this.playlist[moveFromIdx]);
                        this.playlist.splice(moveFromIdx, 1);
                    }
                    break;
                case 'removeEmote':
                    let evRemoveEmote: EvRemoveEmote = data as EvRemoveEmote;
                    let removeEmoteIdx = this.emotes.findIndex((e: Emote) => e.name === evRemoveEmote.name);
                    if (removeEmoteIdx !== -1) {
                        this.emotes.splice(removeEmoteIdx, 1);
                    }
                    break;
                case 'updateEmote':
                    let evUpdateEmote: Emote = data as Emote;
                    let updateEmoteIdx = this.emotes.findIndex((e: Emote) => e.name === evUpdateEmote.name);
                    if (updateEmoteIdx !== -1) {
                        this.emotes[updateEmoteIdx] = evUpdateEmote;
                    }
                    break;
                case 'setLeader':
                    this.leader = data as string;
                    break;
                case 'setUserProfile':
                    let evSetUserProfile: EvSetUserProfile = data as EvSetUserProfile;
                    let setUserProfile: User | undefined = this.userlist.find((u: User) => u.name.toLowerCase() === evSetUserProfile.name.toLowerCase());
                    if (setUserProfile != null) {
                        setUserProfile.profile = evSetUserProfile.profile;
                    }
                    break;
                case 'kick':
                    this.kicked = data as Kicked;
                    break;
                case 'partitionChange':
                    console.log('TODO: partitionChange');
                    break;
                case 'voteskip':
                    this.voteskip = data as Voteskip;
                    break;
                case 'setTemp':
                    let evSetTemp: EvSetTemp = data as EvSetTemp;
                    let setTemp: PlaylistItem | undefined = this.playlist.find((pi: PlaylistItem) => pi.uid === evSetTemp.uid);
                    if (setTemp != null) {
                        setTemp.temp = evSetTemp.temp;
                    }
                    break;
                default:
                    //debugger;
                    break;
            }
        } catch (exc) {
            //debugger;
        }

        return events;
    }
}
