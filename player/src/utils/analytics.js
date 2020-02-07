export default (action, category, label) => {
    window.gtag && gtag('event', action, {
        'event_category': category,
        'event_label': label
    })

    if(window.mixpanel) {
        mixpanel.track(category, { action, label })
        mixpanel.people.set({ $last_seen: new Date().toISOString() })
    }
}