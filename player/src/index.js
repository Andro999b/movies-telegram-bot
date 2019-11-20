/* global Playerjs */

import groupBy from 'lodash.groupby'

const API_BASE = 'https://6gov3btrq2.execute-api.eu-central-1.amazonaws.com/dev/api'

const urlParams = new URLSearchParams(window.location.search)
const provider = urlParams.get('provider')
const id = urlParams.get('id')

function fileGrouping(files) {
    const groupedByPath = groupBy(files, (file) => file.path || 'root')
    return Object.keys(groupedByPath)
        .map((key) => ({
            name: key,
            files: groupedByPath[key]
        }))
}

const qualities = ['240', '360', '480', '720']

function mapFile({ name, url, manifestUrl, alternativeUrls }) {
    let file
    if(manifestUrl) {
        file = manifestUrl
    } else if(url) {
        if(alternativeUrls) {
            file = alternativeUrls.concat(url) 
                // .map((url) => {
                //     const q = qualities.find((q) => url.indexOf(q) != -1)
                //     if(q) {
                //         return `[${q}]${url}`
                //     }
                // })
                .filter((it) => it)
                .reverse()
                .join(' or ')
        } else {
            file = url
        }
    }

    return {
        title: name,
        file
    }
}

function startPlayer(playlist) {
    new Playerjs({ 
        id: 'player', 
        file: playlist
    })
    
}

if (provider && id) {
    fetch(`${API_BASE}/trackers/${provider}/items/${encodeURIComponent(id)}`)
        .then((response) => response.json())
        .then(({ files }) => fileGrouping(files))
        .then((directories) => {
            let playlist
            if(directories.length == 1) {
                playlist = directories[0].files.map(mapFile)
            } else {
                playlist = directories.map(({name, files}) => ({
                    title: name,
                    folder: files.map(mapFile)
                }))
            }

            // console.dir(directories, playlist)

            startPlayer(playlist) 
        })
}