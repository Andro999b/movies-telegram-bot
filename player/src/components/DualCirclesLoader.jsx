import React, { Component } from 'react'

class DualCirclesLoader extends Component {
    render() {
        return (
            <div className="loader">
                <div className="lds-dual-ring" />
            </div>
        )
    }
}

export default DualCirclesLoader