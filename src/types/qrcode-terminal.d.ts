declare module 'qrcode-terminal' {
  interface GenerateOptions {
    small?: boolean;
  }

  export function generate(
    text: string,
    opts?: GenerateOptions,
    callback?: (output: string) => void
  ): void;
}
