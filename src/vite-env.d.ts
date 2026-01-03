/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot: {
    accept: () => void
    dispose: (cb: () => void) => void
  }
}

declare module '*.css?inline' {
  const content: string
  export default content
}
