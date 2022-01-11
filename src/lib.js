/*
  lib.js
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com
  API Harness shared code

  objects:

  uobj = {    //url object
    url
    protocol
    username
    host
    path
    port
    query
    fragment
  }

*/

const q = {
  insertInList: function( oldList, pos, str ){ //duplicate list and insert new item at pos
    let list = oldList.slice()
    if( pos > list.length ) pos = list.length
    list.splice( pos, 0, str)
    return list
  },
  url:{
    // references:
    // https://en.wikipedia.org/wiki/URL
    // https://developer.mozilla.org/en-US/docs/Web/API/URL
    join: function( uobj, qList = null ){    // return a valid url 
      function test( key, pre, post ){
        if( uobj[key] !== undefined && uobj[key] !== '')
          return pre +uobj[key] +post
        return ''
      }
      
      let url = test('protocol', '',  ':')
      
      if( uobj.user || uobj.host || uobj.port ) url += '//'
      url += test('user', '',  '@')
      url += test('host', '',  '')
      url += test('port', ':', '')
      
      if( uobj.path && uobj.path[0] !== '/') url += '/'
      url += test('path', '', '')

      if(qList === null)
        url += test('query',    '?', '')
      else 
      if( qList.length !== 0 ) {
        let str = ''
        qList.forEach( ( val, idx ) => {
          if( val.trim() === '' ) return
          if( str !== '') str += '&'
          str += val 
        })
        if( str !== ''){
          if( str[0] !== '?' ) url += '?'
          url += str
        }
      }
      url += test('fragment',     '#', '')

      return url
    },
    parse( str ){ //return a uobj
      const url = new URL( str )
      let uobj = {
        url: str,
        protocol: url.protocol,
        username: url.username,
        host:   url.hostname,
        port:   url.port,
        path:   url.pathname,
        query:  url.search,
        // qList:  [],
        fragment:   url.fragment
      }
      if( ':' === uobj.protocol[ url.protocol.length -1 ] )
        uobj.protocol = uobj.protocol.substring( 0 , uobj.protocol.length -1 )
      // if( '/' === uobj.path[ 0 ] )
      //   uobj.path = uobj.path.substring( 1 )
      if( '?' === uobj.query[ 0 ] )
        uobj.query = uobj.query.substring( 1 )
      // uobj.qList = uobj.query.split('&')

      return uobj
    }
  },
  query: {
    join( list ){     // return array items concatenated with &
      if( list.length === 0 )
        return ''
      return list.join( '&' )
    },
    parse: function( str ){   // return array of query parameters
      if( str === '')
        return []
      return str.split('&')
    }
  }
}

export default q