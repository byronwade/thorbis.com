// Temporary ambient declarations to satisfy TypeScript when consuming
// the local workspace package `@thorbis/design` during watch mode.
// The actual types exist in the design package's dist, but tsup's DTS
// generation in this package may not always resolve them in dev.

declare module '@thorbis/design' {
  export function cn(...inputs: unknown[]): string;
}

declare module '@thorbis/design/utils' {
  export function cn(...inputs: unknown[]): string;
}


