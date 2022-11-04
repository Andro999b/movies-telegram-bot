import { observable, action, makeObservable } from 'mobx'

class NotificationsStore {
  @observable message: string | null
  @observable open = false

  constructor() {
    makeObservable(this)
  }

  @action.bound showMessage(message: string): void {
    this.message = message
    this.open = true
  }

  @action.bound hideMessage(): void {
    this.open = false
  }
}

export default NotificationsStore