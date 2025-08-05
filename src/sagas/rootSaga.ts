import { all, fork } from "redux-saga/effects";
import authSaga from "./authSaga";
import documentSaga from "./documentSaga";
import chatSaga from "./chatSaga";

export default function* rootSaga() {
  yield all([
    fork(authSaga), // Make sure this is included!
    fork(documentSaga),
    fork(chatSaga),
  ]);
}
