const CryptoJS = require('crypto-js')

const data = 'U2FsdGVkX1+32pedXfAXxVRCkrCFYBJDEZfl2k7ht+rud6UrBxAle7pWz47P+eGw81LrR39u2TxBGDO6rjcHuX85zPVr8HZGfgBTn8FlwCcKv1vQ36j0LFTqh1YH4YUUGzjAYaytj0wrVFN5oG8kFzN+tp3+HnaUIdd7H1ZowCQ='

console.log(CryptoJS.AES.decrypt(data, 'iso10126').toString(CryptoJS.enc.Utf8))