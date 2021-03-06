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
import { NavigateBeforeRounded as BackIcon } from '@material-ui/icons'
import { List as VirtualizedList, AutoSizer } from 'react-virtualized'
import DownloadSelector from './DownloadSelector'
import { observer } from 'mobx-react'
import memoize from 'memoize-one'

@observer
class PlayerPlayList extends Component {

    constructor(props) {
        super(props)

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
            id: '_root',
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
            if (file.path) {
                const path = file.path.split('/')
                const node = getNode(path)
                node.files.push(file)
            } else {
                root.files.push(file)
            }
        })

        return root
    })

    renderDownload(file) {
        const { device: { playlist: { title }}} = this.props
        return file.urls ? (
            <ListItemSecondaryAction>
                <DownloadSelector file={file} title={title} />
            </ListItemSecondaryAction>
        ) : null
    }

    renderFileRow(file, style, key, selected) {
        return (
            <div style={style} key={key}>
                <ListItem
                    button
                    selected={selected}
                    onClick={() => this.hundleSelect(file)}
                >
                    <ListItemText primary={
                        <span style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>
                            {file.name}
                        </span>
                    } />
                    {this.renderDownload(file)}
                </ListItem>
            </div>
        )
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


        const selectedIndex = node.files.findIndex(
            (file) => selectedIds.indexOf(file.id) != -1
        )

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
                    <List className="player__file-list-container">
                        <AutoSizer>
                            {({ width, height }) => (
                                <VirtualizedList
                                    width={width}
                                    height={height}
                                    rowCount={node.files.length}
                                    scrollToIndex={selectedIndex}
                                    rowHeight={48}
                                    rowRenderer={({ key, index, style }) => this.renderFileRow(node.files[index], style, key, index == selectedIndex)}
                                />
                            )}
                        </AutoSizer>
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