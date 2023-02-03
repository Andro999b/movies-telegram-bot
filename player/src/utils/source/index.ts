import { File } from '../../types'
import gidonlineSource from './gidonline'

export type SourceLoader = (sourceId: string, params: Record<string, unknown>) =>
  Promise<Partial<File>> | Partial<File>;

const sourceLoaders: Record<string, SourceLoader> = {
  'gidonline': gidonlineSource
}

export default sourceLoaders

