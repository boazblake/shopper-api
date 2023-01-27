import {IStore} from "./types.ts"

const stores = new Map<string, IStore>()

const getAll = (): IStore[] => Array.from(stores.values())


const getById = (id: string): IStore | undefined => stores.get(id)

const deleteById = (id: string): boolean => stores.delete(id)

const updateById = (id: string, store: IStore): IStore | undefined => {
  deleteById(id)
  return add(id, store)
}

const add = (id: string, store: IStore): IStore | undefined => stores.set(id, store).get(id)


export default {getAll, getById, add, updateById, deleteById}
