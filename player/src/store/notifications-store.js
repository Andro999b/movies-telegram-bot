import { observable, action, makeObservable } from 'mobx'

class NotificationsStore {
    @observable message = null
    @observable open = false

    constructor() {
      makeObservable(this)
    }

    @action.bound showMessage(message) {
      this.message = message
      this.open = true
    }

    @action.bound hideMessage() {
      this.open = false
    }
}

export default NotificationsStore