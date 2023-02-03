import createHttpsProxy from 'https-proxy-agent'

export const tunnelHttpsAgent = createHttpsProxy(process.env.PROXY_URL)