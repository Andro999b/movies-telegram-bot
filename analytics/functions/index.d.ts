declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
    ANALYTIC_TABLE: string
    CACHE_TABLE: string
    MONGODB_URI: string
    PRIVATE_KEY: string
    PROJECT_ID: string
  }
}