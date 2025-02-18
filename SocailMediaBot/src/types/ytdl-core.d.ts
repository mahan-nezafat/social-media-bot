declare module 'ytdl-core' {
    export interface VideoInfo {
        videoDetails: {
            title: string;
        };
    }

    export function getInfo(url: string): Promise<VideoInfo>;
    export function validateURL(url: string): boolean;
    export default function ytdl(url: string, options?: any): any;
} 