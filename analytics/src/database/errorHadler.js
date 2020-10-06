export default (err) => {
    console.dir(err) // eslint-disable-line
    switch (err.code) {
        case 'AccessDeniedException':
        case 'ExpiredToken':
        case 'NotAuthorizedException':
        case 'UnrecognizedClientException':
            window && window.location.reload()
    }
    throw err
}