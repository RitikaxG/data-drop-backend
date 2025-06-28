declare module "youtube-transcript-api" {
  export default class TranscriptAPI {
    static getTranscript(
      videoId: string
    ): Promise<
      Array<{
        text: string;
        start: string;
        duration: string;
      }>
    >;
  }
}
