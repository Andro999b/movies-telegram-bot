import React, { Component } from 'react'
import { IconButton } from '@material-ui/core'
import { Favorite, FavoriteBorder } from '@material-ui/icons'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

@inject(({ watchHistoryStore: { watching, deleteFromHistory, getHistoryItem } }) => ({
    watching,
    getHistoryItem,
    deleteFromHistory
}))
@observer
class AddHistoryButton extends Component {
    state = {
        inHistory: false
    }

    onAddHistory = async () => {
        const { watching, playlist } = this.props
        await watching(playlist)
        this.setState({ inHistory: true })
    }

    onDeleteHistory = async () => {
        const { deleteFromHistory, playlist: { provider, id } } = this.props
        await deleteFromHistory(`${provider}#${id}`)
        this.setState({ inHistory: false })
    }

    async componentDidMount() {
        const item = await this.props.getHistoryItem(this.props.playlist)
        this.setState({ inHistory: item != null })
    }

    render() {
        const { inHistory } = this.state

        return (
            <div className="add-history-btn">
                {inHistory ?
                    <IconButton onClick={this.onDeleteHistory}>
                        <Favorite />
                    </IconButton> :
                    <IconButton onClick={this.onAddHistory}>
                        <FavoriteBorder />
                    </IconButton>
                }
            </div>
        )
    }
}

AddHistoryButton.propTypes = {
    playlist: PropTypes.object.isRequired,
    deleteFromHistory: PropTypes.func,
    watching: PropTypes.func,
    getHistoryItem: PropTypes.func,
}

export default AddHistoryButton
