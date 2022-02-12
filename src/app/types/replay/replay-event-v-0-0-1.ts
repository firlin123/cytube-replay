/* {
    time: 1634605499848, 
    type: "on", 
    event: "login", 
    data: [
        {success: true, name: "replay", guest: false}
    ]
} */
export type ReplayEventV001 = {
    time: number,
    type: string,
    event: string,
    data: Array<any>
};
