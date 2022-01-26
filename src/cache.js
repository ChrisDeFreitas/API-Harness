/*
  cache.js
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com
  - cache api calls for ApiHarness
  - no operations performs on cached content ( no side effects )

  cache.items[ n ] = {
    id: number
    url: ''
    name:''         
    notes: ''
    headers: []     // [ 'xxx:yyy', ... ]
 //   disabled: {
   //   headers: []   // [ 'xxx:yyy', ... ]
     // query: []     // [ 'xxx=yyy', ... ]
    //}
  }
*/

import q from'./public.js'

const cache = {

  items: [],
  lastid: 0,

  idMake(){
    return ++this.lastid
  },
  byID( id ){
    if( typeof id !== 'number' )
      throw new Error( `cache.byID() error, id provide is bad: [${id}]` )
    
    let itm = this.items.find( itm => itm.id === id )
    return itm
  },
  getIdx( itmToFind ){
    return this.items.findIndex( itm => itm.id === itmToFind.id )
  },

  first: function( itm ){
    return this.items[0]
  },
  last: function( itm ){
    return this.items[ this.items.length -1 ]
  },
  prior: function( itm ){
    if( itm === null )
      throw new Error(`cache.prior() error, itm is not provided.`)
    
    let idx = this.getIdx( itm )
    if( idx === -1) return null
    idx--
    if( idx < 0 ) return null
    return this.items[ idx ]
  },
  next: function( itm ){
    if( itm === null )
      throw new Error(`cache.prior() error, itm is not provided.`)
    
    let idx = this.getIdx( itm )
    if( idx === -1) return null
    idx++
    if( idx >= this.items.length ) return null
    return this.items[ idx ]
  },
 
  add: function( url, name=null, notes='', headers=[], disabledHeaders=[], disabledQuery=[] ){
    if( url === undefined || url === null | url === '')
      throw new Error( `cache.add() error, bad URL received.` )

   let itm = {
      id: this.idMake(),
      name: ( name !== null ?name :q.url.host( url )),
      url: url,
      notes: notes,
      headers: headers.slice(),
 //     disabled: {
 //       headers: disabledHeaders,
 //       query: disabledQuery
 //     }
    }
      
    this.items.push( itm )
    return itm
  },
  update: function( itm ){
    //todo: add validations
    
    let idx = this.getIdx( itm )
    if( idx === -1)
      throw new Error(`cache.update() error, itm.id not found:[${itm.id}].`)
      
    this.items[ idx ].url = itm.url
    this.items[ idx ].name = itm.name
    this.items[ idx ].notes = itm.notes
    this.items[ idx ].headers = itm.headers.slice()
    
    return this.items[ idx ]
  },
  // delete: function( id ){
  // },

  show: function( id = null ){
    if( id === null ){
      console.log( `cache.show(), all ${this.items.length} items:`, this.items )
      return
    }

    let itm = this.byID( id )
    console.log( `cache.show() id = ${id}`, itm )
  }
}

export default cache