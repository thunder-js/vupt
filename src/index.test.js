import { createStore, applyMiddleware, combineReducers } from 'redux'
import { createReducer } from './index'
import { normalize, schema } from 'normalizr';


const tag = new schema.Entity('tag')

const category = new schema.Entity('category', {
  tags: [tag]
})
const post = new schema.Entity('post', {
  category: category
})
const user = new schema.Entity('user', {
  posts: [post]
});


const schemaMap = {
  user
}

const rootReducer = combineReducers({
  model: createReducer(schemaMap)
})


const fetchUsersSuccess = () => ({
  type: 'FETCH_USERS_SUCCESS',
  payload: [{
    id: 'user1',
    name: 'rafael'
  }, {
    id: 'user2',
    name: 'pedro'
  }],
  metadata: {
    model: true,
    schema: 'user'
  }
})


const fetchNestedSuccess = () => ({
  type: 'FETCH_USERS_SUCCESS',
  payload: [{
    id: 'user1',
    name: 'rafael',
    posts: [{
      id: 'post1',
      text: 'hi from rafael',
      category: {
        id: 'cat1',
        name: 'category1',
        tags: [{
          id: 'tag1',
          label: 'tag1 label'
        }, {
          id: 'tag2',
          label: 'tag2 label'
        }]
      }
    }]
  }, {
    id: 'user2',
    name: 'pedro',
    posts: []
  }],
  metadata: {
    model: true,
    schema: 'user'
  }
})

const fetchMoreUsersSuccess = () => ({
  type: 'FETCH_USERS_SUCCESS',
  payload: [{
    id: 'user1',
    name: 'rafael',
    age: 24,
    posts: [{
      id: 'post1',
      text: 'hi from rafael',
    }]
  }, {
    id: 'user3',
    name: 'bruno',
  }],
  metadata: {
    model: true,
    schema: 'user'
  }
})

describe('middleware', () => {
  it('works for a simple case', () => {
    const store = createStore(rootReducer)

    store.dispatch(fetchUsersSuccess())
    
    const modelState = store.getState()

    expect(modelState).toEqual({
      model: {
        user: {
          user1: {
            id: 'user1',
            name: 'rafael'
          },
          user2: {
            id: 'user2',
            name: 'pedro'
          }
        }  
      }
    })
  })

  it('works for nested structure', () => {
    const store = createStore(rootReducer)
    store.dispatch(fetchNestedSuccess())
    const state = store.getState()

    expect(state).toEqual({
      model: {
        user: {
          user1: {
            id: 'user1',
            name: 'rafael',
            posts: ['post1']
          },
          user2: {
            id: 'user2',
            name: 'pedro',
            posts: []
          }
        },
        post: {
          post1: {
            id: 'post1',
            text: 'hi from rafael',
            category: 'cat1'
          }
        },
        category: {
          cat1: {
            id: 'cat1',
            name: 'category1',
            tags: ['tag1', 'tag2']
          }
        },
        tag: {
          tag1: {
            id: 'tag1',
            label: 'tag1 label'
          },
          tag2: {
            id: 'tag2',
            label: 'tag2 label'
          }
        }
      }
    })
  })

  it('works when obtaining more info about the same entity', () => {
    const store = createStore(rootReducer)
    store.dispatch(fetchUsersSuccess())
    store.dispatch(fetchMoreUsersSuccess())
    const state = store.getState()

    expect(state).toEqual({
      model: {
        user: {
          user1: {
            id: 'user1',
            name: 'rafael',
            age: 24,
            posts: ['post1']
          },
          user2: {
            id: 'user2',
            name: 'pedro',
          },
          user3: {
            id: 'user3',
            name: 'bruno'
          }
        },
        post: {
          post1: {
            id: 'post1',
            text: 'hi from rafael',
          }
        },
      }
    })

  })
})