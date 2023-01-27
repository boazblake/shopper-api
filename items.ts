import {IItem} from "./types.ts"

const Items = new Map<string, IItem>()


const getAll = (): IItem[] => Array.from(Items.values())

const getById = (id: string): IItem | undefined => Items.get(id)

const deleteById = (id: string): boolean => Items.delete(id)

const updateById = (id: string, item: IItem): IItem | undefined => {
  deleteById(id)
  return add(id, item)
}

const add = (id: string, item: IItem): IItem | undefined => Items.set(id, item).get(id)


export default {getAll, getById, add, updateById, deleteById}

