import moment from 'moment'
import { DATE_FORMAT, REGION } from '../constants'
import { AttributeValue, DynamoDB, QueryCommandInput } from '@aws-sdk/client-dynamodb'
import { getCredentialProvider } from './userpool'
import { Credentials, Provider } from '@aws-sdk/types'

export const getDocClient = async (credentials?: Credentials | Provider<Credentials>): Promise<DynamoDB> => {
  return new DynamoDB({
    apiVersion: '2012-08-10',
    region: REGION,
    credentials
  })
}

export const getDateFor = (pass: number): string => moment().subtract(pass, 'days').format(DATE_FORMAT)
export const getMonthFor = (pass: number): string => moment().subtract(pass, 'months').format('YYYY-M')

export interface QueryResult {
  items: Record<string, AttributeValue>[],
  query: QueryCommandInput,
  lastKey: Record<string, AttributeValue>
}

export const runQuery = async (query: QueryCommandInput, credentials?: Credentials | Provider<Credentials>): Promise<QueryResult> => {
  const docClient = await getDocClient(credentials ?? await getCredentialProvider())
  const data = await docClient.query(query)

  return {
    items: data.Items!,
    query,
    lastKey: data.LastEvaluatedKey!
  }
}

export const getIndexForPeriod = (period: string): string | undefined => {
  if (period.includes('month'))
    return 'monthIdx'

  return
}
