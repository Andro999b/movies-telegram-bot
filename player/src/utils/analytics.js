export default (action, category, label) => {
    window.gtag && gtag('event', action, {
        'event_category': category,
        'event_label': label
    })
}