import CryptoJS from 'crypto-js'

const decode = (file: string, passkey:string, spliter = '##'): string => {
  const parts = file.split(spliter)
  
  const cp = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(parts[0].substring(2)),
  })

  if(parts[1]) {
    cp.iv = CryptoJS.enc.Hex.parse(parts[1])
  }
  
  if(parts[2]) {
    cp.salt = CryptoJS.enc.Hex.parse(parts[2])
  }

  return JSON.parse(CryptoJS.AES.decrypt(cp, passkey).toString(CryptoJS.enc.Utf8))
}

export default decode