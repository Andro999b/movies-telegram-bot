declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
    BOT_TYPE: 'ua' | 'films' | 'anime'
    ANALYTIC_TABLE: string
    CACHE_TABLE: string
    MONGODB_URI: string
    ANALYTIC_RETENTION: string
    ANALYTIC_TIMEZONE: string
    STAGE: string
    CACHE_TTL: string
    PLAYER_URL: string
    ALLOWED_DOMAINS: string
    ACCOUNT_ID: string
    REGION: string
    PROVIDERS: string
    TOKEN: string
    LOG_GROUP: string
    PROXY_URL: string
  }
}

declare module 'superagent-charset' {
  import { SuperAgent, SuperAgentRequest } from 'superagent'

  type SuperAgentCharsetReq = SuperAgentRequest & {
    charset(): SuperAgentCharsetReq
  }

  export default function (superagent: SuperAgent<SuperAgentRequest>): SuperAgent<SuperAgentCharsetReq>
}