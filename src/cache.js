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
    log:'',
    result:'',
    headers: []     // [ 'xxx:yyy', ... ]
  //  disabled: {
  //    headers: []   // [ 'xxx:yyy', ... ]
  //    query: []     // [ 'xxx=yyy', ... ]
  //   }
  }

*/
import json5 from 'json5'
import q from'./public.js'

const cache = {

  items: [
    {
      id: 0,
      "url": "https://jsonplaceholder.typicode.com/posts/1",
      "name": "jsonplaceholder.typicode.com",
      "notes": "A free online REST API that you can use whenever you need some fake data:\n/posts  100 posts\n/comments  500 comments\n/albums  100 albums\n/photos  5000 photos\n/todos  200 todos\n/users  10 users",
      log:'',
      result:``,
      // {"_embedded":{"city:search-results":[{"_links":{"city:item":{"href":"https://api.teleport.org/api/cities/geonameid:6167865/"}},"matching_alternate_names":[{"name":"toronto"},{"name":"Toronto"}],"matching_full_name":"Toronto, Ontario, Canada"},{"_links":{"city:item":{"href":"https://api.teleport.org/api/cities/geonameid:10103951/"}},"matching_alternate_names":[{"name":"Toronto"}],"matching_full_name":"Toronto, New South Wales, Australia"},{"_links":{"city:item":{"href":"https://api.teleport.org/api/cities/geonameid:5174095/"}},"matching_alternate_names":[{"name":"Toronto"}],"matching_full_name":"Toronto, Ohio, United States"}]},"_links":{"curies":[{"href":"https://developers.teleport.org/api/resources/Location/#!/relations/{rel}/","name":"location","templated":true},{"href":"https://developers.teleport.org/api/resources/City/#!/relations/{rel}/","name":"city","templated":true},{"href":"https://developers.teleport.org/api/resources/UrbanArea/#!/relations/{rel}/","name":"ua","templated":true},{"href":"https://developers.teleport.org/api/resources/Country/#!/relations/{rel}/","name":"country","templated":true},{"href":"https://developers.teleport.org/api/resources/Admin1Division/#!/relations/{rel}/","name":"a1","templated":true},{"href":"https://developers.teleport.org/api/resources/Timezone/#!/relations/{rel}/","name":"tz","templated":true}],"self":{"href":"https://api.teleport.org/api/cities/?search=toronto\u0026geohash="}},"count":3}      
      headers: []
    }
  ],
  lastid: 0,

  init: function( callback = null ){
    // assume: each record has a url
    // assume: each url is valid
    console.log('cache.init() load data from:', document.URL +'cacheData.json5')

    q.fetch( document.URL +'cacheData.json5',
      null,
      function( type, obj ){
        if( type === 'error')
          alert(`cache.init() error, could not load cacheData.js: [${obj}].`)
        if( type === 'response'){
          let str = obj.data.trim()
          let list = json5.parse( str )
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
 
  add: function(
    url, name=null, notes='', 
    log = '', result = '',
    headers=[], disabledHeaders=[], disabledQuery=[] 
  ){
    if( url === undefined || url === null | url === '')
      throw new Error( `cache.add() error, bad URL received.` )

   let itm = {
      id: this.idMake(),
      name: ( name !== null && name !== '' ?name :q.url.host( url )),
      url: url,
      notes: notes,
      log: log,
      result: log,
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
    this.items[ idx ].log = itm.log
    this.items[ idx ].result = itm.result
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
