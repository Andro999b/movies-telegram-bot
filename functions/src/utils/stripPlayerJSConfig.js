module.exports = (script) => {
    const parts = script.match(/new Playerjs\(([^)]+)\);/)

    if (parts) {
        let config

        eval(`config = ${parts[1]}`)
        return config
    }

    return null
}