import React, { Component } from 'react'
import LocalPlayer from '../components/LocalPlayer'

class PlayerView extends Component {
    render() {
        return (
            <div className="screan-content">
                <LocalPlayer />
            </div>
        )
    }
}

export default PlayerView