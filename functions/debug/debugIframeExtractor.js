import extractor from 'src/utils/playerjsembed'
import { inspect } from 'util'

extractor('https://tortuga.wtf/embed/117')
  .then((files) => console.log(inspect(files, false, null, true)))// eslint-disable-line
  .catch(console.error)