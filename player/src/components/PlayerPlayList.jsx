import React, { useMemo, useState } from 'react'
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
import { observer } from 'mobx-react-lite'

const getTreeNode = (root, path) => {
  let node = root

  path.forEach((part) => {
    let child = node.files.find(
      ({ id }) => id == part
    )
    node = child
  })

  return node
}

const getTree = ({ title, files }) => {
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
}

const Download = ({ playlist, file }) =>
  file.urls ? (
    <ListItemSecondaryAction>
      <DownloadSelector file={file} title={playlist.title} />
    </ListItemSecondaryAction>
  ) : null

const FileRow = ({ playlist, file, style, selected, hundleSelect }) => {
  return (
    <div style={style}>
      <ListItem style={{ cursor: 'pointer' }} selected={selected}>
        <ListItemText
          onClick={() => hundleSelect(file)}
          primary={
            <span style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>
              {file.name}
            </span>
          } />
        <Download file={file} playlist={playlist} />
      </ListItem>
    </div>
  )
}

export default observer(({ device, open, onFileSelected }) => {
  const { playlist, currentFileIndex } = device
  const { files } = playlist

  const [path, setPath] = useState(() => {
    const path = files[currentFileIndex].path
    return path ? path.split('/') : []
  })

  const tree = useMemo(() => getTree(playlist), [playlist])
  const node = useMemo(() => getTreeNode(tree, path), [tree, path])

  const hundleBack = () => {
    path.pop()
    setPath([].concat(path))
  }

  const hundleSelect = (file) => {
    if (file.files) {
      path.push(file.id)
      setPath([].concat(path))
    } else {
      onFileSelected(files.findIndex(({ id }) => id == file.id))
    }
  }

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
              <IconButton edge="start" onClick={hundleBack}>
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
                rowRenderer={({ key, index, style }) => (
                  <FileRow
                    key={key}
                    file={node.files[index]}
                    style={style}
                    playlist={playlist}
                    selected={index == selectedIndex}
                    hundleSelect={hundleSelect}
                  />
                )}
              />
            )}
          </AutoSizer>
        </List>
      </Paper>
    </Slide>
  )
})
