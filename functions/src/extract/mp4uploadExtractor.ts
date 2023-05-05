import regExprExtractor from './regExprExtractor'


export default regExprExtractor([{
  expression: /IFRAME\|embed\|(\w+)\|_blank\|.*\|mp4\|video\|(\w+)\|(\d+)\|src\|videojs/,
  transform: (matches): string => {
    const [,prefix,token,port] = matches
    return `https://${prefix}.mp4upload.com:${port}/d/${token}/video.mp4`
  }
}])