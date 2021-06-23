import { observable } from 'mobx'
import moment from 'moment'

const TABLE_NAME = 'watchesTable-prod'

export default observable({
    error: null,
    loading: false,

    reload(force) {
        this.loading = true
        this.error = null
    }
})