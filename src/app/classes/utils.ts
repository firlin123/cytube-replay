export class Utils {
    private constructor() {}
    
    public static startEndToString(start: number, end: number): string {
        let startD: Date = new Date(start);
        let endD: Date = new Date(end);
        let diffDay: boolean = startD.toDateString() !== endD.toDateString();
        let startS: string = startD.toLocaleDateString() + (diffDay ? "" : (" " + startD.toLocaleTimeString()));
        let endS: string = diffDay ? endD.toLocaleDateString() : endD.toLocaleTimeString();
        return startS + ' - ' + endS;
    }
}
