import { PlaylistItem } from "./playlist-item";

export interface EvQueue {
    after: number | 'prepend' | 'append',
    item: PlaylistItem
}
