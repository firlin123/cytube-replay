import { Media } from "./media";

export type PlaylistItem = { 
    media: Media;
    queueby: string; 
    temp: boolean; 
    uid: number; 
};
