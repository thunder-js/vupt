import { normalize } from 'normalizr';
import merge from 'deepmerge'

export const createReducer = (schemaMap) => (state = {}, action) => {
  if (!(action && action.metadata && action.metadata.model)) {
    return state
  }
  
  const data = action.payload
  const schemaName = action.metadata.schema
  const schema = schemaMap[schemaName]
  const schemaAgainst = Array.isArray(data) ? [schema] : schema

  const normalizedData = normalize(data, schemaAgainst);  
  const { entities, result } = normalizedData
  
  return merge(state, entities)
}