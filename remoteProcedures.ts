// deno-lint-ignore-file no-explicit-any
import { DEV } from"./server.ts"

let db: Deno.Kv
export async function initDB() {
   db = await Deno.openKv();
}

/** remove a record */
export async function deleteRow(key: string[]) {
   if (DEV) console.info('delete Row: ', key)
   if (!db) await initDB()
   return await db.delete(key)
}

/** get a record */
export async function getRow(key: string[]) {
   if (DEV) console.info('get Row: ', key)
   if (!db) await initDB()
   const result = await db.get(key)
   return result
}

/** set a record */
export async function setRow( key: string[], value: any ) {
   if (!db) await initDB()
   const result = await db.set(key, value);
   if (result.versionstamp) {
      fireMutationEvent(key, "SetRow")
   } else {
      console.error('kvdb.setRow failed!')
   }
   if (DEV) console.log(`SetRow -- key: ["${key[0]}"] value: "${value}", result "${JSON.stringify(result)}"`)
   return result
}

/** Fire an event reporting a DenoKv record mutation */
const fireMutationEvent = (key: string[], type: string) => {
   const bc = new BroadcastChannel("sse-rpc")
   bc.postMessage({ txID: -1, procedure: "MUTATION", params: { key, type } })
   bc.close();
}