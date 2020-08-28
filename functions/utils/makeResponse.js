module.exports = (body,  status = 200, headers) => ({
    statusCode: status,
    headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        'Content-Type': 'application/json', 
        ...headers
    },
    body: JSON.stringify(body)
})