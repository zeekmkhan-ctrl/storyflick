import { type SchemaTypeDefinition } from 'sanity'
import { storyType } from './story'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [storyType],
}
