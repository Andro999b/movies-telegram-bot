import React, { Component } from 'react'
import { IconButton } from '@material-ui/core'
import { Favorite, FavoriteBorder } from '@material-ui/icons'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

@inject(({ watchHistoryStore: { watching, deleteFromHistory, history } }) => ({
    watching,
    history,
    deleteFromHistory
}))
@observer
class AddHistoryButton extends Component {
  onAddHistory = () => {
      const { watching, playlist } = this.props
      watching(playlist)
  };

  onDeleteHistory = () => {
      const { deleteFromHistory, playlist: { provider, id} } = this.props
      deleteFromHistory(`${provider}#${id}`)
  };

  render() {
      const { history, playlist } = this.props
      const inHistory = history && 
        history.find(
            ({ provider, id }) => playlist.provider == provider && playlist.id == id
        ) != null

      return (
          <div className="add-history-btn">
              { inHistory ? 
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
    history: PropTypes.object,
}

export default AddHistoryButton
