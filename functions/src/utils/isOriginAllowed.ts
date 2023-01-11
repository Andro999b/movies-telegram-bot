import { APIGatewayProxyEvent } from 'aws-lambda'

const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS.split(',')

export default (event: APIGatewayProxyEvent): boolean => {
  if(ALLOWED_DOMAINS.length == 0)
    return true

  const origin = event.headers?.origin ?? event.headers?.Origin
  if (!origin)
    return false

  return ALLOWED_DOMAINS.findIndex((domain) => origin.endsWith(domain)) != -1
}