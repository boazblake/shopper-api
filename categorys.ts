import {ICat} from "./types.ts"
import {uuid} from './utils.js'

export const toCatObj = (cat, order, storeId) => ({
  id: uuid(),
  storeId,
  title: cat,
  collapsed: false,
  dragCollapsed: false,
  order
})

export const defaultCats = [
  'Clothing',
  'Baby',
  'Meat',
  'Baking',
  'Fruit/Veg',
  'Alcohol',
  'Dairy',
  'Frozen',
  'Bread',
  'Cleaning',
  'Snacks',
  'Deli',
  'Pharmacy',
  'Pets'
]

const Cats = new Map<string, ICat>()

const getAll = (): ICat[] => Array.from(Cats.values())

const getById = (id: string): ICat | undefined => Cats.get(id)
const deleteById = (id: string): Boolean => Cats.delete(id)

const updateById = (id: string, store: ICat): ICat | undefined => {
  deleteById(id)
  return add(id, store)
}

const add = (id: string, store: ICat): ICat | undefined => Cats.set(id, store).get(id)


export default {getAll, getById, add, updateById, deleteById, defaultCats}

