const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS.split(',')

module.exports = (event) =>
    event.headers?.origin && ALLOWED_DOMAINS.findIndex((domain) => event.headers.origin.endsWith(domain)) != -1