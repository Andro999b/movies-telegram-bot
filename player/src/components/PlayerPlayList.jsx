import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Paper,
    Slide,
    Toolbar,
    Typography,
    AppBar
} from '@material-ui/core'
import {
    NavigateBeforeRounded as BackIcon,
    GetAppRounded as DownloadIcon
} from '@material-ui/icons'
import { observer } from 'mobx-react'
import memoize from 'memoize-one'

@observer
class PlayerPlayList extends Component {

    constructor(props, context) {
        super(props, context)

        const { device: { playlist: { files }, currentFileIndex } } = props
        let path = files[currentFileIndex].path

        path = path ? path.split('/') : []

        this.state = { path }
    }


    hundleBack = () => {
        this.setState(({ path }) => {
            path.pop()
            return { path }
        })
    }

    hundleSelect = (file) => {
        if (file.files) {
            this.setState(({ path }) => {
                path.push(file.id)
                return { path }
            })
        } else {
            const { device: { playlist: { files } }, onFileSelected } = this.props
            onFileSelected(files.findIndex(({ id }) => id == file.id))
        }
    }

    handleTrackDownload = (file) => {
        const { device: { playlist: { title } } } = this.props

        window.gtag && gtag('event', 'downloadFile', {
            'event_category': 'link',
            'event_label': `${title} - ${file.name}`
        })
    }


    getTreeNode = (root, path) => {
        let node = root

        path.forEach((part) => {
            let child = node.files.find(
                ({ id }) => id == part
            )
            node = child
        })

        return node
    }

    getTree = memoize(({ title, files }) => {
        const root = {
            name: title,
            files: []
        }

        const getNode = (path) => {
            let node = root

            path.forEach((part) => {
                let child = node.files.find(
                    ({ id }) => id == part
                )

                if (child == null) {
                    child = {
                        id: part,
                        name: part,
                        files: []
                    }
                    node.files.push(child)
                }

                node = child
            })

            return node
        }

        files.forEach((file) => {
            const path = file.path ? file.path.split('/') : []
            const node = getNode(path)

            node.files.push(file)
        })

        return root
    })

    renderDownload(file) {
        if (!file.files) {
            const downloadUrl = file.extractor ? null : file.url
            if (downloadUrl)
                return (
                    <ListItemSecondaryAction>
                        <IconButton
                            component='a'
                            href={downloadUrl}
                            download={downloadUrl}
                            target="_blank"
                            onClick={() => this.handleTrackDownload(file)}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                )
        }
    }

    render() {
        const { path } = this.state
        const { device: { playlist, currentFileIndex }, open } = this.props
        const { files } = playlist

        const tree = this.getTree(playlist)
        const node = this.getTreeNode(tree, path)

        //create current path
        let currentPath = files[currentFileIndex].path
        const currentFileId = files[currentFileIndex].id
        currentPath = currentPath ? currentPath.split('/') : []
        const selectedIds = currentPath.concat(currentFileId)

        return (
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                <Paper elevation={12} square className="player__file-list">
                    {path.length != 0 &&
                        <AppBar position="static" color='secondary'>
                            <Toolbar>
                                <IconButton edge="start" onClick={this.hundleBack}>
                                    <BackIcon />
                                </IconButton>
                                <Typography variant="h6">
                                    {path.join(' / ')}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    }
                    <List>
                        {node.files.map((file) => (
                            <ListItem
                                button
                                key={file.id}
                                selected={selectedIds.indexOf(file.id) != -1}
                                onClick={() => this.hundleSelect(file)}
                            >
                                <ListItemText primary={
                                    <span style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>
                                        {file.name}
                                    </span>
                                } />
                                {this.renderDownload(file)}
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Slide>
        )
    }
}

PlayerPlayList.propTypes = {
    device: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onFileSelected: PropTypes.func.isRequired
}

export default PlayerPlayList