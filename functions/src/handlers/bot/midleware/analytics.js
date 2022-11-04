export default (tracker, bot) => async (ctx, next) => {
    const events = []

    ctx.track = (type, data = {}) => {
        events.push({
            time: Date.now(),
            uid: ctx.from.id,
            bot,
            firstname: ctx.from.first_name,
            lastname: ctx.from.last_name,
            username: ctx.from.username,
            language_code: ctx.from.language_code,
            type,
            ...data 
        })
    }

    await next()
    if(events.length) await tracker(events)
}