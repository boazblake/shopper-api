import {Application, Router, helpers, oakCors, etag, R} from "./deps.ts"
import Stores from './stores.ts'
import Cats, {defaultCats, toCatObj} from "./categorys.ts"
import Items from './items.ts'
import logger from './logger.ts'
import {Icat, IStore, IItem} from './types.ts'
import {rangeDiff} from './utils.js'

const log = (m: string) => (v: any) => {console.log(m, v); return v}
const range = (size: number) => [...Array(size).keys()]



const port = 8000
const app = new Application()
const router = new Router()

router.get('/stores', (ctx) => {
  ctx.response.body = Stores.getAll()
})


router.get('/stores/:id', (ctx) => {
  let {id} = helpers.getQuery(ctx, {mergeParams: true})

  ctx.response.body = Stores.getById(id)
})

router.post('/stores', async ctx => {
  let {value} = ctx.request.body({type: 'json'})
  let store = await value
  let last = Stores.getAll().at(-1)
  if (last) {
    store.order = (last.order) + 1
  }
  defaultCats.map((cat, idx) => toCatObj(cat, idx, store.id)).forEach(cat => Cats.add(cat.id, cat))
  Stores.add(store.id, store)
  ctx.response.body = Stores.getById(store.id)
})

router.put('/stores/:id', async ctx => {
  let {id} = helpers.getQuery(ctx, {mergeParams: true})
  let {value} = ctx.request.body({type: 'json'})
  let store = await value
  let prev = Stores.getById(id)
  if (prev) {
    if ((prev.order) != (store.order)) {
      let idx = range(Math.abs((prev.order) - (store.order)))
      let ord = (prev.order) > (store.order)
      let xs = Stores.getAll().filter((x: IStore) => idx.includes((x.order)))
      xs.forEach((x: IStore) => {
        x.order = ord ? ((x.order) + 1) : ((x.order) - 1)
        Stores.updateById(x.id, x)
      })
    }
  }
  Stores.updateById(id, store)
  ctx.response.body = Stores.getById(id)
})


router.options('/stores/:id', oakCors({origin: "*"}))
  .delete('/stores/:id', oakCors({origin: "*"}), async ctx => {
    let {id} = helpers.getQuery(ctx, {mergeParams: true})
    let catIds = R.compose(R.pluck('id'), R.filter(R.propEq('storeId', id)))(Cats.getAll())
    let items = Items.getAll()
    let itemIds = R.compose(R.pluck('id'), R.filter((x: IItem) => catIds.includes(x.catId)))(items)
    console.log('delete 0store', itemIds)
    itemIds.forEach((id: string) => Items.deleteById(id))
    catIds.forEach(((id: string) => Cats.deleteById(id)))
    Stores.deleteById(id)
    ctx.response.body = []
  })

router.get('/cats', (ctx) => {
  ctx.response.body = Cats.getAll()
})

router.post('/cats', async (ctx) => {
  let {value} = ctx.request.body({type: 'json'})
  let cat = await value
  let last = Cats.getAll().filter(R.propEq('storeId', cat.storeId)).sort(R.prop('order')).at(-1)
  if (last) {
    cat.order = (last.order) + 1
  }
  console.log('cat', cat, last)
  Cats.add(cat.id, cat)
  ctx.response.body = Cats.getById(cat.id)
})

router.put('/cats/:id', async ctx => {
  let {id} = helpers.getQuery(ctx, {mergeParams: true})
  let {value} = ctx.request.body({type: 'json'})
  let cat = await value
  let prev = Cats.getById(id)
  if (prev) {
    if ((prev.order) != (cat.order)) {
      let idx = range(Math.abs((prev.order) - (cat.order)))
      let ord = (prev.order) > (cat.order)
      let xs = Cats.getAll().filter((x: Icat) => idx.includes((x.order)))
      xs.forEach((x: Icat) => {
        x.order = ord ? ((x.order) + 1) : ((x.order) - 1)
        Cats.updateById(x.id, x)
      })
    }
  }
  Cats.updateById(id, cat)
  ctx.response.body = Cats.getById(id)
})

router.options('/cats/:id', oakCors({origin: "*"}))
  .delete('/cats/:id', oakCors({origin: "*"}), async ctx => {
    let {id} = helpers.getQuery(ctx, {mergeParams: true})
    let itemIds = R.compose(R.pluck('id'), R.filter(R.propEq('catId', id)))(Items.getAll())
    console.log('delete cat', itemIds)
    itemIds.forEach(((id: string) => Items.deleteById(id)))
    Cats.deleteById(id)
    ctx.response.body = []
  })

router.get('/items', (ctx) => {
  ctx.response.body = Items.getAll()
})

router.post('/items', async (ctx) => {
  let {value} = ctx.request.body({type: 'json'})
  let item = await value
  // let last = Items.getAll().filter(R.propEq('catId', item.catId)).sort(R.prop('order')).at(-1)
  // if (last) {
  //   item.order = (last.order) + 1
  // }
  Items.add(item.id, item)
  ctx.response.body = Items.getById(item.id)
})

router.post('/items/reorder', async (ctx) => {
  let {value} = ctx.request.body({type: 'json'})
  let [dragged, swap] = await value

  let newDragOrder = swap.order
  let newSwapOrder = dragged.order

  dragged.order = newDragOrder
  swap.order = newSwapOrder
  const updates = [dragged, swap]
  updates.forEach(item => Items.updateById(item.id, item))
  ctx.response.body = []//Items.getById(item.id)
})

router.put('/items/:id', async (ctx) => {
  let {id} = helpers.getQuery(ctx, {mergeParams: true})
  let {value} = ctx.request.body({type: 'json'})
  let item = await value
  let oldItem = Items.getById(id)
  if (oldItem) {
    if (oldItem.catId == item.catId) {
      //same cat
      if ((oldItem.order) != (item.order)) {
        let idxs = rangeDiff(oldItem.order, item.order)
        let isAsc = (oldItem.order) < (item.order)
        let xs = Items.getAll().filter((x: IItem) => idxs.includes((x.order)))
        xs.forEach((x: IItem) => {
          console.log('X before', x)
          x.order = isAsc ? x.order + 1 : x.order - 1
          console.log('X after', x)
          Items.updateById(x.id, x)
        })
      }
    } else {
      // handle prev cat items
      let prevXs = Items.getAll().filter((x: IItem) => oldItem && (x.order) >= (oldItem.order))
      prevXs.forEach(x => {
        x.order = (x.order + 1)
        Items.updateById(x.id, x)
      })

      // handle new cat items

      let newXs = Items.getAll().filter((x: IItem) => x.catId == item.catId && (x.order) > (item.order))
      newXs.forEach((x: IItem) => {
        x.order = ((x.order) + 1)
        Items.updateById(x.id, x)
      })
    }
  }
  Items.updateById(item.id, item)
  ctx.response.body = Items.getById(item.id)
})

router.options('/items/:id', oakCors({origin: "*"}))
  .delete('/items/:id', oakCors({origin: "*"}), async ctx => {
    let {id} = helpers.getQuery(ctx, {mergeParams: true})
    Items.deleteById(id)
    ctx.response.body = []
  })

app.use(etag.factory())
app.use(logger.logger)
app.use(logger.responseTime)
app.use(oakCors({origin: "*"}))
app.use(router.allowedMethods())
app.use(router.routes())

app.addEventListener('listen', ({port}) => log(`Listening on: localhost`)(port))

await app.listen({port})

