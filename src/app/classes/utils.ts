import { Site } from "../enums/site";
import { Media } from "../types/replay-state/media";

type mediaToUrlMapType = {
    [site: string]: {
        [version: string]: (media: Media) => string;
    };
};

type pageVersionMapType = {
    [site: string]: (start: number) => string
}

export class Utils {
    private constructor() { }

    public static startEndToString(start: number, end: number): string {
        let startD: Date = new Date(start);
        let endD: Date = new Date(end);
        let diffDay: boolean = startD.toDateString() !== endD.toDateString();
        let startS: string = startD.toLocaleDateString() + (diffDay ? "" : (" " + startD.toLocaleTimeString()));
        let endS: string = diffDay ? endD.toLocaleDateString() : endD.toLocaleTimeString();
        return startS + ' - ' + endS;
    }

    private static mediaToUrlMap: mediaToUrlMapType | null = null;
    private static pageVersionMap: pageVersionMapType | null = null;

    public static mediaToUrl(site: Site, version: string, media: Media): string {
        if (this.mediaToUrlMap == null) {
            this.mediaToUrlMap = this.createMediaToUrlMap();
        }
        if (this.mediaToUrlMap[site] != null) {
            if (this.mediaToUrlMap[site][version] != null) {
                return this.mediaToUrlMap[site][version](media);
            }
        }
        return '#';
    }
    public static pageVersion(site: Site, start: number): string {
        if (this.pageVersionMap == null) {
            this.pageVersionMap = this.createPageVersionMap();
        }
        if (this.pageVersionMap[site] != null) {
            return this.pageVersionMap[site](start);
        }
        return '1';
    }
    private static createPageVersionMap(): pageVersionMapType {
        this.pageVersionMap = {};
        this.pageVersionMap[Site.CyTube] = function (start: number): string {
            if (start > 1645362602000)
                return '4';
            else if (start > 1644158271000)
                return '3';
            else if (start > 1643263187000)
                return '2';
            else
                return '1'
        }
        return this.pageVersionMap;
    }
    private static createMediaToUrlMap(): mediaToUrlMapType {
        let mediaToUrlMap: mediaToUrlMapType = this.mediaToUrlMap = {};
        this.mediaToUrlMap[Site.CyTube] = {
            '1': (media: Media): string => {
                switch (media.type) {
                    case "us":
                        return "https://ustream.tv/channel/" + media.id;
                    case "hb":
                        return "https://www.smashcast.tv/" + media.id;
                    default:
                        return mediaToUrlMap[Site.CyTube]['3'](media);
                }
            },
            '2': (media: Media): string => mediaToUrlMap[Site.CyTube]['3'](media),
            '3': (media: Media): string => {
                switch (media.type) {
                    case "yt":
                        return "https://youtube.com/watch?v=" + media.id;
                    case "vi":
                        return "https://vimeo.com/" + media.id;
                    case "dm":
                        return "https://dailymotion.com/video/" + media.id;
                    case "sc":
                        return media.id;
                    case "li":
                        const [account, event] = media.id.split(';');
                        return `https://livestream.com/accounts/${account}/events/${event}`;
                    case "tw":
                        return "https://twitch.tv/" + media.id;
                    case "rt":
                        return media.id;
                    case "gd":
                        return "https://docs.google.com/file/d/" + media.id;
                    case "fi":
                        return media.id;
                    case "hl":
                        return media.id;
                    case "sb":
                        return "https://streamable.com/" + media.id;
                    case "tc":
                        return "https://clips.twitch.tv/" + media.id;
                    case "cm":
                        return media.id;
                    case "cu":
                        return media.meta.embed.src;
                    case "pt":
                        if (media.meta.embed.onlyLong) {
                            return `https://${media.meta.embed.domain}/videos/watch/${media.meta.embed.uuid}`;
                        } else {
                            return `https://${media.meta.embed.domain}/w/${media.meta.embed.short}`;
                        }
                    case "bc":
                        return `https://www.bitchute.com/video/${media.id}/`;
                    case "bn":
                        const [artist, track] = media.id.split(';');
                        return `https://${artist}.bandcamp.com/track/${track}`;
                    case "od":
                        const [user, video] = media.id.split(';');
                        return `https://odysee.com/@${user}/${video}`;
                    case "nv":
                        return `https://www.nicovideo.jp/watch/${media.id}`;
                    default:
                        return "#";
                }
            },
            '4': (media: Media): string => mediaToUrlMap[Site.CyTube]['3'](media),
        };
        return this.mediaToUrlMap;
    }
}
