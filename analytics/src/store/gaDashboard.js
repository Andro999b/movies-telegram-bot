import { observable } from "mobx";
import { invokeGA } from '../database/lambda'

export default observable({
    reload() {
        invokeGA().then(console.log)
    }
})