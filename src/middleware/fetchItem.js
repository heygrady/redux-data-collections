import { put, call } from 'redux-saga/effects'
import { beginLoadingItem, endLoadingItem, loadItem } from '../actions/item'
import { loadIncludedItems } from '../actions/collection'
import { selectType, selectId, selectOptions } from '../selectors/action'
import { getFetchActionFunc } from './'
import invariant from 'invariant'

const fetchItem = function * (action) {
  const fetchAction = getFetchActionFunc()
  if (fetchAction === undefined) {
    // eslint-disable-next-line max-len
    invariant(false, 'fetchAction should be defined using createRootSaga(fetchAction). (details at https://github.com/heygrady/redux-data/tree/master/src/middleware/readme.md)')
    return
  }
  const type = selectType(action)
  const id = selectId(action)
  if (!type || !id) {
    // eslint-disable-next-line max-len
    invariant(false, 'fetchItem should define a type and id, like fetchItem({ type: \'post\', id: \'some_id\' }). If you\'re trying to search, use fetchItems instead')
    return
  }
  const options = selectOptions(action)
  try {
    yield put(beginLoadingItem({ type, id, options }))
    const { data, included } = yield call(fetchAction, action)
    if (included) {
      yield put(loadIncludedItems({ data: included }))
    }
    if (Array.isArray(data)) {
      // eslint-disable-next-line max-len
      invariant(false, 'fetchItem recieved an array from fetchAction. Expected a single item. Either return a single item or use fetchItems to fetch an array.')
    }
    yield put(loadItem({ type, id, data, options }))
    yield put(endLoadingItem({ type, id, options }))
  } catch (error) {
    console.log(error)
  }
}

export default fetchItem
