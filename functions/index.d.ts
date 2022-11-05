declare module 'superagent-charset' {
  import { SuperAgent, SuperAgentRequest } from 'superagent'

  type SuperAgentCharsetReq = SuperAgentRequest & {
    charset(): SuperAgentCharsetReq
  }

  export default function (superagent: SuperAgent<SuperAgentRequest>): SuperAgent<SuperAgentCharsetReq>
}