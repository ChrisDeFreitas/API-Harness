/*
  cache.js
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com
  - cache api calls for ApiHarness
  - no operations performs on cached content ( no side effects )
  - data loaded at the bottom of this file


  cache.items[ n ] = {
    id: number
    url: ''
    name:''         
    notes: ''
    headers: []     // [ 'xxx:yyy', ... ]
  //  disabled: {
  //    headers: []   // [ 'xxx:yyy', ... ]
  //    query: []     // [ 'xxx=yyy', ... ]
  //   }
  }

*/
import q from'./public.js'

const cache = {

  items: [
    {
      id: 0,
      url: "http://archive.org/wayback/available?url=example.com&timestamp=20060101",
      name: "Wayback Machine",
      notes: "Home: https://archive.org/help/wayback_api.php\nIf not available/accessible: archived_snapshots==={}",
      headers: []
    }
  ],
  lastid: 0,

  init: function( callback = null ){
    // assume: each record has a url
    // assume: each url is valid
    // if( cache.items.length > 1 ) return

    q.fetch( '/cacheData.json',
      null,
      function( type, obj ){
        if( type === 'error')
          alert(`cache.init() error, could not load cacheData.js: [${obj}].`)
        if( type === 'response'){
          // console.log( 'CacheData.json:', obj.data )
          let str = obj.data.trim()
          let list = JSON.parse( str )
          console.log( 'CacheData List:', list )
          cache.load( list )
          cache.show()
          if( callback !== null)
            callback( true )
        }
     })
  },

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

  first: function(){
    return this.items[0]
  },
  last: function(){
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
      name: ( name !== null && name !== '' ?name :q.url.host( url )),
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
  load: ( list ) =>{
    // assume: each record has a url
    // assume: each url is valid
    list.forEach( obj => {
      if( obj.url === undefined || obj.url === '') return
      cache.add( 
        obj.url, 
        (obj.name ?obj.name :''), 
        (obj.notes ?obj.notes :''), 
        (obj.headers ?obj.headers :[]), 
      )
    })
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
      console.log( `cache.show(), all ${this.items.length} items:\n`, this.items )
      return
    }

    let itm = this.byID( id )
    console.log( `cache.show() id = ${id}`, itm )
  },

}

// cache.init()
export default cache
