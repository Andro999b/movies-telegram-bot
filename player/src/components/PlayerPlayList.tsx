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
import {
  List as _VirtualizedList,
  AutoSizer as _AutoSizer,
  ListProps,
  AutoSizerProps
} from 'react-virtualized'
import DownloadSelector from './DownloadSelector'
import { observer } from 'mobx-react-lite'
import { Device } from '../store/player-store'
import { Playlist, File } from '../types'


// dirty hack
const VirtualizedList = _VirtualizedList as unknown as React.FC<ListProps>
const AutoSizer = _AutoSizer as unknown as React.FC<AutoSizerProps>

interface Node {
  id: string
  name: string
  children?: Node[]
  files?: File[]
}

const getTreeNode = (root: Node, path: string[]): Node | undefined => {
  let node: Node = root

  for (const part of path) {
    const child = node.children?.find(({ id }) => id == part)

    if (!child) break
    node = child
  }

  return node
}

const getTree = ({ title, files }: Playlist): Node => {
  const root: Node = {
    id: '_root',
    name: title
  }

  const getNodeFile = (path: string[] | undefined): File[] => {
    let node = root

    if (path) {
      for (const part of path) {
        if (!node.children) node.children = []

        let child = node.children.find(
          ({ id }) => id == part
        )

        if (child == null) {
          child = {
            id: part,
            name: part,
          }
          node.children.push(child)
        }

        node = child
      }
    }

    if (!node.files) node.files = []

    return node.files
  }


  files.forEach((file) => {
    getNodeFile(file.path?.split('/')).push(file)
  })

  return root
}

interface DownloadProps {
  playlist: Playlist
  file: File
}

const Download: React.FC<DownloadProps> = ({ playlist, file }) => (
  <ListItemSecondaryAction>
    <DownloadSelector file={file} title={playlist.title} />
  </ListItemSecondaryAction>
)


interface FileRowProps {
  playlist: Playlist
  fileOrNode: File | Node
  style: React.CSSProperties
  selected: boolean
  handleFileSelect: (file: File) => void
  handleFolderSelect: (node: Node) => void
}

const Row: React.FC<FileRowProps> = ({
  playlist,
  fileOrNode,
  style,
  selected,
  handleFileSelect,
  handleFolderSelect
}) => {
  const node = (fileOrNode as Node)
  const isFile = node.children === undefined && node.files === undefined
  return (
    <div style={style}>
      <ListItem style={{ cursor: 'pointer' }} button selected={selected}>
        <ListItemText
          onClick={(): void => isFile ? handleFileSelect(fileOrNode) : handleFolderSelect(fileOrNode)}
          primary={
            <span style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>
              {fileOrNode.name}
            </span>
          } />
        {isFile && <Download file={fileOrNode} playlist={playlist} />}
      </ListItem>
    </div>
  )
}

interface Props {
  device: Device
  open: boolean
  onFileSelected: (fileIndex: number) => void
}

const PlayerPlayList: React.FC<Props> = ({ device, open, onFileSelected }) => {
  const { playlist, currentFileIndex } = device
  const { files } = playlist

  const [path, setPath] = useState<string[]>(() => {
    const path = files[currentFileIndex].path
    return path ? path.split('/') : []
  })

  const tree = useMemo(() => getTree(playlist), [playlist])
  const node = useMemo(() => getTreeNode(tree, path), [tree, path])!

  const hundleBack = (): void => {
    path.pop()
    setPath(path.concat([]))
  }

  const handleFolderSelect = (node: Node): void => {
    path.push(node.id)
    setPath(path.concat([]))
  }

  const handleFileSelect = (file: File): void => {
    onFileSelected(files.findIndex(({ id }) => id == file.id))
  }

  //create current path
  const currentFile = files[currentFileIndex]
  const currentPath = currentFile.path?.split('/') ?? []
  const selectedIds = currentPath.concat(currentFile.id)

  let list = new Array<Node | File>()
  if (node.children) list = list.concat(node.children)
  if (node.files) list = list.concat(node.files)

  const selectedIndex = list.findIndex(
    ({ id }) => selectedIds.indexOf(id) != -1
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
          </AppBar>}
        <List className='player__file-list-container'>
          <AutoSizer>
            {({ width, height }): React.ReactElement => (
              <VirtualizedList
                width={width}
                height={height}
                rowCount={list.length}
                scrollToIndex={selectedIndex}
                rowHeight={48}
                rowRenderer={({ key, index, style }): React.ReactElement => (
                  <Row
                    key={key}
                    fileOrNode={list[index]}
                    style={style}
                    playlist={playlist}
                    selected={index == selectedIndex}
                    handleFileSelect={handleFileSelect}
                    handleFolderSelect={handleFolderSelect}
                  />
                )} />
            )}
          </AutoSizer>
        </List>
      </Paper>
    </Slide >
  )
}

export default observer(PlayerPlayList)
