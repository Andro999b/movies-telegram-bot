const extract = require('./extract')

extract({
    url: 'http://cdn.123moviesapp.net/embed/ee51cef162d960851ecc2e75fb05563b2ca6935f7d51bb519d2cbc92d573c89def3e4c645d75528ee56363ce64bf6f398a65361336e40d2e30780e8f333fa7b040fc25147290c2db40b8a0181f53bca66ca16c330b32eef8077977413b1272f1a4d82f01d4fb3413f37a00701a',
    type: '123moviesapp'
}).then(console.log) // eslint-disable-line 