export type ChannelOpts = { 
    afk_timeout: number; 
    allow_ascii_control: boolean; 
    allow_dupes: boolean; 
    allow_voteskip: boolean; 
    block_anonymous_users: boolean; 
    chat_antiflood: boolean; 
    chat_antiflood_params: 
    { 
        burst: number; 
        sustained: number; 
        cooldown: number; 
    }; 
    enable_link_regex: boolean; 
    externalcss: string; 
    externaljs: string; 
    maxlength: number; 
    new_user_chat_delay: number; 
    new_user_chat_link_delay: number; 
    pagetitle: string; 
    password: boolean; 
    playlist_max_duration_per_user: number; 
    playlist_max_per_user: number; 
    show_public: boolean; 
    torbanned: boolean; 
    voteskip_ratio?: number; 
};
