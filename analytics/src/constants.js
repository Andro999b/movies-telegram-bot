export const REGION = 'eu-north-1'
export const ACCOUNT_ID = '534471691183'
export const IDENTITY_POOL_ID = 'eu-north-1:3c6432c5-1b1c-461a-9ce4-eb74eae48ab4'
export const USER_POOL_ID = 'eu-north-1_d8JLDMKpI'
export const APP_CLIENT_ID = '1elbhdln2i766j6t1237le67sj'
export const TABLE_NAME = 'analyticsTable-prod'
export const EVENTS_UPDATE_INTERVAL = 1000 * 30
export const DATE_FORMAT = 'YYYY-M-D'
export const GA_DATE_FORMAT = 'YYYY-MM-DD'

export const NAMES ={
    last7days: 'Last 7 days',
    last30days: 'Last 30 Days',
    current_month: 'Current month',
    previous_month: 'Previous month',
    last3months: 'Three months',
}

export const PROVIDERS = [
    'videocdn',
    'rezka',
    'kinogo',
    'kinovod',
    'seasonvar',
    'anidub',
    'anitubeua',
    'animedia',
    'animevost',
    'anigato',
    'eneyida'
]

export const PERIODS = Object.keys(NAMES)

export const COLORS = [
    '#35618f', 
    '#e71761', 
    '#dc3c07', 
    '#214324', 
    '#18857f', 
    '#66c7d3', 
    '#391d74', 
    '#a194dc', 
    '#62ce75'
]

export const LOG_GROUPS = [
    '/aws/lambda/movies-telegram-bot-prod-info',
    '/aws/lambda/movies-telegram-bot-prod-extract',
    '/aws/lambda/movies-telegram-bot-prod-source',
    '/aws/lambda/movies-telegram-bot-prod-bot',
    '/aws/lambda/movies-telegram-bot-prod-animebot',
    'web-prod'
]