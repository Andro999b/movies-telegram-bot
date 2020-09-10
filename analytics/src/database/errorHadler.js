export default (err) => {
    console.dir(err) // eslint-disable-line
    switch (err.code) {
        case 'AccessDeniedException':
        case 'ExpiredToken':
        case 'UnrecognizedClientException':
            window && window.location.reload()
    }
    throw err
}