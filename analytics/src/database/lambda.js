
let lambda
export const getLambda = () => {
    if (!lambda) lambda = new AWS.Lambda({ apiVersion: '2015-03-31' })

    return lambda
}

export const invokeGA = (from, to) => new Promise((resolve, reject) => {
    var params = {
        FunctionName: 'arn:aws:lambda:eu-central-1:534471691183:function:analytics-functions-dev-ga',
        Payload: '{}'
    }
    getLambda().invoke(params, function (err, data) {
        if (err) reject(err); 
        else resolve(data);           
    })
})