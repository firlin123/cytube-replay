import { UserMeta } from "./user-meta";
import { UserProfile } from "./user-profile";

export type User = {
    name: string;
    rank: number; 
    profile: UserProfile;
    meta: UserMeta;
};
