/*
  cache.js
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com
  - cache api calls for ApiHarness
  - no operations performs on cached content ( no side effects )

  cache.items[ n ] = {
    id: number
    name:''         
    url: ''
    headers: []     // [ 'xxx:yyy', ... ]
 //   disabled: {
   //   headers: []   // [ 'xxx:yyy', ... ]
     // query: []     // [ 'xxx=yyy', ... ]
    //}
  }
*/

import q from'./lib.js'

const cache = {

  items: [],

  lastid: 0,
  idMake(){
    return ++this.lastid
  },
  byId( id ){
    if( typeof id !== 'string' )
      throw new Error( `cache.byId() error, id provide is bad: [${id}]` )
    
    let itm = this.items.find( itm => itm.id === id )
    return itm
  },
  getIdx( itmfind ){
    return this.items.findIndex( itm => itm.id === itmfind.id )
  },

  add: function( url, name=null, headers=[], disabledHeaders=[], disabledQuery=[] ){
    if( url === undefined || url === null | url === '')
      throw new Error( `cache.add() error, bad URL received.` )

   let itm = {
      id: this.idMake(),
      name: ( name !== null ?name :q.url.host( url )),
      url: url,
      headers: headers,
 //     disabled: {
 //       headers: disabledHeaders,
 //       query: disabledQuery
 //     }
    }
      
    this.items.push( itm )
    return itm
  },
  show: function( id = null ){
    if( id === null ){
      console.log( `cache.show(), all ${this.items.length} items:`, this.items )
      return
    }

    let itm = this.byId( id )
    console.log( `cache.show() id = ${id}`, itm )
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
 
  // delete: function( id ){
  // }
  // get: function( id ){
  //   return this.items[ id ]
  // },
  update: function( itm, url, headers = [] ){
    //todo: add validations
    
    let idx = this.getIdx( itm )
    this.items[ idx ].url = url
    this.items[ idx ].headers = headers.slice()
    
    return this.items[ idx ]
  },
}

export default cache