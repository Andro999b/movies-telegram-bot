export default (body,  status = 200, headers) => ({
    statusCode: status,
    headers: {
        'Content-Type': 'application/json', 
        ...headers
    },
    body: JSON.stringify(body)
})