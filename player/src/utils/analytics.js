export default (action, label) => {
    window.gtag && gtag('event', action, {
        'event_category': 'player',
        'event_label': label
    })
}