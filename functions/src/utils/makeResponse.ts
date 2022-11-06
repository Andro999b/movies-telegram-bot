import { APIGatewayProxyResult } from 'aws-lambda'

export default (body: unknown, status = 200, headers?: Record<string, string>): APIGatewayProxyResult => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    ...headers
  },
  body: JSON.stringify(body)
})