declare module 'google-it' {
  interface GoogleItOptions {
    query: string;
    limit?: number;
  }

  interface GoogleItResult {
    title: string;
    link: string;
    snippet: string;
  }

  function googleIt(options: GoogleItOptions): Promise<GoogleItResult[]>;

  export = googleIt;
}
