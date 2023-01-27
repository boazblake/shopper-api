export type IStore = {
  id: string
  title: string
  order: number
}


export type ICat = {
  id: string
  storeId: string
  title: string
  collapsed: boolean
  dragCollapsed: boolean
  order: number
}

export type IItem = {
  id: string
  catId: string
  title: string
  quantity: number
  unit: string
  purchased: false,
  price: number
  notes: string
  order: number
}

