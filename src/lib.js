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

var q = {
  bytesToStr:function(bytes){
		if(bytes < 1024) return bytes+' bytes'
		if(bytes < (1024 *1024)) return (Math.round(bytes /1024*100) /100)+' KB'
		if(bytes < (1024 *1024 *1024)) return (Math.round(bytes /1024/1024*100) /100)+' MB'
		return (Math.round(bytes /1024/1024/1024 *100) /100)+' GB'
	},
  insertInList: function( oldList, pos, str ){ //duplicate list and insert new item at pos
    let list = oldList.slice()
    if( pos > list.length ) pos = list.length
    list.splice( pos, 0, str)
    return list
  },
  timeFormat: function(ms, format) {
		if(format==='ms') return ms+'ms'
		if(format==='s') return (Math.round(ms/1000*10)/10)+'sec'			//99.9sec
		if(format==='m') return (Math.round(ms/1000/60*10)/10)+'min'		//99.9min
		if(format==='h') return (Math.round(ms/1000/60/60*100)/100)+'hrs'	//99.99hrs
		if(format==='d') return (Math.round(ms/1000/60/60/24*100)/100)+'days'	//99.99days
	},
  ajax(
    url = '', 
    abortController = null, 
    callback = null, 
    debug = false
  ){
    if(callback === null) debug = true

    let _start = performance.now()
    let prgnum = 0

    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onerror = function( event ){
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onerror
      console.log('xhr.onerror', event)
      if( callback )
        callback( 'error', 'A network error occurred - no Javascript info available.', debug )
    }
    xhr.onprogress = function( event ) {
      if( callback != null){
        // event.timeStamp = ( performance.now() -_start )
        callback( 'progress', event, debug, ++prgnum)
      }
    }      
    xhr.onreadystatechange = function(){
      let sdur = q.timeFormat(( performance.now() -_start ), 'ms' )
      if( this.readyState === XMLHttpRequest.OPENED ){  // 1
        if(debug) console.log( sdur, 'Connected to server...') 
      } else
      if( this.readyState === XMLHttpRequest.HEADERS_RECEIVED ){    //2
        if(debug) console.log( sdur, 'Headers received from server...')
      } else
      if( this.readyState === XMLHttpRequest.LOADING ){   // 3
        if(debug) console.log( sdur, 'Loading data...')
      } else
      if(this.readyState === XMLHttpRequest.DONE) {     // 4
        if( this.status === 200 ) {
          if(debug) console.log( sdur, 'AJAX Success', this)
          if( callback !== null )
            callback( 'response', this, debug )
        } else 
        if( this.status !== 0 && this.statusText !== '' ) {

          console.log( sdur, 'AJAX Error', this.status, this.getAllResponseHeaders(), this )
          if( callback !== null )
            callback( 'error', this, debug )
        }
        // else will be caught by onerror handler

        console.log('Total processing time: ' +q.timeFormat(( performance.now() -_start ), 'ms' ) )
      }
    }
    // xhr.withCredentials = true
    // xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
    // xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true')
    xhr.send()
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
    obj: function(){
      return {
        url: '',
        protocol: '',
        username: '',
        host:   '',
        port:   '',
        path:   '',
        query:  '',
        // qList:  [],
        fragment: ''
      }
    },
    parse( str ){ //return a uobj
      str = str.trim()
      if( str === '' ) return q.url.obj()

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
      if( '/' === uobj.path[ 0 ] )
        uobj.path = uobj.path.substring( 1 )
      if( '?' === uobj.query[ 0 ] )
        uobj.query = uobj.query.substring( 1 )
      // uobj.qList = uobj.query.split('&')

      return uobj
    }
  },
  query: {
    join( list ){     // return array items concatenated with &
      if( list === undefined || list.length === 0 )
        return ''
      return list.join( '&' )
    },
    parse: function( str ){   // return array of query parameters
      if( str === undefined || str === '')
        return []
      return str.split('&')
    }
  }
}

export default q  