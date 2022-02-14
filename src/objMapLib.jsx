/*
  objMapLib.js
  - functions to parse an object and manipulate results
  - shared data and functions for ObjGrid.jsx
  - by Chris DeFreitas
  
*/
//'use strict'
// import { addedDiff, deletedDiff, updatedDiff } from 'deep-object-diff'
import json5 from 'json5'


var objMapLib = {
  lastId: -1,
  keyid : 0,
  
  create( obj ){    // return a mapList of obj
    // assume: typeof obj === object
    
    function callback( key, val, parent ){

      let map = objMapLib.mapMake( val, key, parent )
      if( map.type === 'array' && typeof val[0] === 'object' ){
        map.items = objMapLib.arrMapCreate( val, callback, map )
      }else
      if( map.type === 'array' || map.type === 'object' ){ 
        map.items = objMapLib.iterateObj( val, callback, map )
      }

      return map
    }
    
    this.lastId = -1
    this.keyid = 0
    let parent = this.mapMake( obj, 'root', null )
    
    if( parent.type === 'array' && typeof obj[0] === 'object' )
      parent.items = this.arrMapCreate( obj, callback, parent )
    else
      parent.items = this.iterateObj( obj, callback, parent )

   return parent
  },
  findId( id, mapItems ){
    let result =  null
    function cbItem( map ){
      if( map.id === id ){
        result = map
        return false
      }
      return null
    }
    this.iterateMap( mapItems, cbItem )
    return result
  },
  findKey( key, map ){
    return map.items.find( itm => key === itm.key )
  },
//  getDimensions( obj ){
    //return this.iterateObj( obj )
//  },
  arrMapCreate( arList, callback, parent ){
    // purpose:
    //  1. define properties of 2 dimensonal array
    //  2. store child props in parent.items[0]
    //  3. set parent.arType to one of:
    //   1d = [ 1, 2, 3 ]   (initial value)
    //   2d = [ [1, '2', 3], ... ]    (default)
    //   complex = [ [1, '2', {}], ... ]
    //   erratic = [ [1, '2', {}], [1, '2', {}, 4], ... ] (inconsistent data structures found in rows of column)

    let props = this.mapMake( arList[0], 0, parent )
    props.items = null
    parent.arType = '2d'
    
    function cbItem( key, val, itmidx, rowidx ){

      let map = callback( key, val, parent )    // make map and iterate branch
      if( parent.arType !== 'erratic' && map.type === 'object' )
        parent.arType = 'complex'    // row contains scalars and objects  
      if( props.items === null )
        return map
      
      // verify key exists in previous rows
      let idx = props.items.findIndex( itm => itm.key === key )
      if( idx === -1 ){
        parent.arType = 'erratic'    // rows contain different keys
        map.erratic = true    // mark column too
        props.items.push( map )
      }
      else{
        // if map is different from fnd, the column contains different data structures
        //   typically, a column containing both scalar and object/array data in different rows
        // note: this is a simple solution for preformance (and it seems to be pretty rare), 
        //   a more complete solution would use iterateMap() and this logic against each node in tree
        // rules, prefer: more items over less items, array over object, object over scalar, 2d over 1d array
        let fnd = props.items[ idx ]
        if( fnd.items === undefined ){
          if( map.items !== undefined )
            props.items[ idx ] = map
          return null
        }
        if( fnd.items.length > map.items.length )
          return null
        if( fnd.items.length < map.items.length )
          props.items[ idx ] = map
        else{ // items.length same
          fnd.items.forEach( ( mapF, idxF ) => {

            let map2 = map.items[ idxF ]
            if(map2.items === undefined){
              return
            }
            if(map2.items.length < mapF.items.length ){
              fnd.items[idxF] = map2; return
            }
            if(map2.type === 'array' && mapF.type !== 'array' ){
              fnd.items[idxF] = map2; return
            }
            if(map2.type === 'object' && ['array','object'].indexOf( mapF.type ) === -1 ){
              fnd.items[idxF] = map2; return
            }
            if(map2.arType !== undefined){
              if(mapF.arType === undefined){
                fnd.items[idxF] = map2; return
              }
              if(map2.arType !== '1d' && mapF.arType === '1d'){
                fnd.items[idxF] = map2; return
              }
            }
          })
        }
      }

      return null
    }
    function cbRow( itmList, rowidx ){
      if( props.items === null ) props.items = itmList    // store first row
      if( rowidx >= 5 ) return false    // end iterations
      return null
    }
    
    this.iterateArr( arList, cbItem, cbRow )
    return [ props ]  // map.items is an array
  },
  iterateArr( arList, cbItem, cbRow = null, parent = null ){
    // purpose: exec callbacks on array keys
    // assume: cbItem( key, val, itmidx, rowidx, parent )
    // assume: cbRow( itmList, rowidx, parent )
    //
    if( Array.isArray( arList ) === false || typeof arList[0] !== 'object' ){
      throw new Error( `iterateArr() error, arList is not a list of objects.` )
    }
    let rowList = []
    for( let rowidx = 0; rowidx < arList.length; rowidx++ ){
      
      let row = arList[ rowidx ]
      let keys = Object.keys( row )

      let itmList = []
      keys.forEach(( key, itmidx ) => {
        let tmp = cbItem( key, row[key], itmidx, rowidx, parent )
        if( tmp !== null )
          itmList.push( tmp )
      })
      
      if( cbRow !== null ){
        let tmp = cbRow( itmList, rowidx, parent )
        if( tmp === false ) break
        if( tmp !== null ) rowList.push( tmp )
      }
    }
    return rowList
  },
  iterateMap( mapItems, cbItem ){
    // assume: mapItems === map.items
    // assume: cbItem( map ),  where map === map.items[ n ]
    // assume: cbItem().return === false then stop iteration
    // assume: cbItem().return === null then continue iteration
    //
    let result = null
    for( let map of mapItems){
      result = cbItem( map )
      if( result === false ) return false

      if( map.items ){
        result = this.iterateMap( map.items, cbItem )
        if( result === false ) return false
      }
    }
  },
  iterateObj( obj, callback, parent ){
    // purpose:
    // 1. iterate obj
    // 2. call callback on every key in obj
    // 3. if callback result != null then store
    // 4. return stored values
    //
    let items = []    
    for( let key in obj ){
      
      let val = obj[ key ]
      
      let tmp = callback( key, val, parent )
      if( tmp === false ) break
      if( tmp !== null ) items.push( tmp )
    }
    return items
  },
  mapMake( obj, key, parent = null ){
    let map = { 
      id: ++this.lastId, 
      key: key, 
      type: (  Array.isArray( obj ) ?'array' :typeof( obj )),
      lvl: ( parent === null ?0 :parent.lvl +1 ), 
      branch: 0, 
      path: ( parent === null ?'/' :parent.path +parent.key +'/' ),
      selected: false
    }
    if( map.type === 'array' ) map.arType = '1d'    //default, reset in arrMapCreate
    return map
  },
  mapListShow( mapList ){   // write mapList structure to console

    let map = mapList
    let buf = '.'.repeat( map.lvl * 3 )
    let numbuf = map.id +'.' +map.lvl
    numbuf = numbuf +' '.repeat( 5 -numbuf.length )
    let type = map.type
    if( map.arType !== undefined ) type += ' - ' +map.arType
    console.log( `${numbuf}${buf}${mapList.path +map.key} (${type}):` )
  
    if( mapList.items === null ){
      console.log( '     ' +buf +'No items' )
      return
    }
    
    for( let idx = 0; idx < mapList.items.length; idx++ ){   
      map = mapList.items[ idx ]              
      buf = '.'.repeat( map.lvl * 3 )
      numbuf = map.id +'.' +map.lvl
      numbuf = numbuf +' '.repeat( 5 -numbuf.length )   
      if( map.type === 'array' || map.type === 'object' )
        this.mapListShow( map )
      else
        console.log( `${numbuf}${buf}${map.key}:${map.type}` )
    }
  },
  mapListToTableHTML( mapList ){
    let result = ''
    for( let idx = 0; idx < mapList.items.length; idx++ ){   
      let map = mapList.items[ idx ]              
      
      if( map.type === 'array' && map.arType !== '1d' ){
        result += this.mapListToTableHTML( map.items[0] )
      } else
      if( map.type === 'array' || map.type === 'object' ){
        let tmp = this.mapListToTableHTML( map )
        result += `<td>${ map.key }\n  ${ tmp }\n</td>\n`
      } else
        result += `<td>${ map.key }</td>`
    }
    
    return `<table><tbody><tr>\n${result}\n</tr></tbody></table>`

  },
  mapListToTableJSX( mapList, cbKeyClick = null  ){
    let result = []
    let keyid = this.keyid
    for( let idx = 0; idx < mapList.items.length; idx++ ){   

      let map = mapList.items[ idx ]              
      if( map.type === 'array' || map.type === 'object' ){
        let tmp = null
        if( map.type === 'array' && map.arType !== '1d' )
          tmp = this.mapListToTableJSX( map.items[0], cbKeyClick )
        else
          tmp = this.mapListToTableJSX( map, cbKeyClick )
        result.push( 
          <td key={++keyid} data-lvl={map.lvl} >
            <span onClick={cbKeyClick} 
              data-id={map.id} 
              data-selected={map.selected} 
            >{ map.key }</span>
            { tmp }
          </td> 
        )
      } 
      else {
        result.push( 
          <td key={++keyid} data-lvl={map.lvl} >
            <span onClick={cbKeyClick} 
              data-id={map.id} 
              data-selected={map.selected} 
            >{ map.key }</span>
          </td>
        )
      }
    }
    
    return (
      <table key={++keyid} ><tbody key={++keyid} ><tr key={++keyid} >
        {result}
      </tr></tbody></table>
    )
  },
  mapObjToText( mapList, obj ){   // return object noation, similar to console.log( obj ); for testing

    function callback( key, val, parent ){
      let map = objMapLib.findKey( key, parent )

      if( map.type === 'array' || map.type === 'object' ){    
        buffer += objMapLib.mapObjToText( map, val )
        buffer +=  ', '
      }
      else{      
        if( parent.type === 'array' )
          buffer += `${val}, `
        else
        if( parent.type === 'object' )
            buffer += `${key}:${val}, `
        else
          buffer += `\nUnknown parent.type:[${parent.type}]; child key=[${key}].\n`          
      }      
      return null
    }
    function cbItem( key, val, itmidx, rowidx, parent ){  // iterating a two dimensional array
      callback( key, val, props )
      return null
    }
    function cbRow( itmList, rowidx, parent ){
      if( buffer.endsWith(', ') )
        buffer = buffer.slice(0, -2 )
      if( props.type === 'array' )
        buffer += ` ],\n  [ `
      else
      if( props.type === 'object' )
        buffer += ` },\n  { `
      return null
    } 
 
    // start
    let buffer = '' // mapList.key +' = '
    let props = null     // if parent.arType = 2d/complex/erratic
    if( mapList.type === 'object' )
      buffer += `{ `
    else
    if( mapList.arType === '1d' )
      buffer += `[ `
    else
    if( mapList.type === 'array' ){  // 2d, complex, or erratic
      buffer += `[ \n  `
      props = mapList.items[0]
      if( props.type === 'array' )
        buffer += `[ `
      else
        buffer += `{ `
    }
        
    // iterate
    if( mapList.type === 'array' && typeof obj[0] === 'object' )
      this.iterateArr( obj, cbItem, cbRow, mapList )
    else
      this.iterateObj( obj, callback, mapList )
     
    // done
    if( mapList.type === 'object' ){
      if( buffer.endsWith(', ') )
        buffer = buffer.slice(0, -2 )
      buffer += ` }`
    } else
    if( mapList.arType === '1d' ){
      if( buffer.endsWith(', ') )
        buffer = buffer.slice(0, -2 )
      buffer += ` ]`
    } else
    if( mapList.type === 'array' ){  // complex/erratic
      if( props.type === 'array' ){
        if( buffer.endsWith(',\n  [ ') )
          buffer = buffer.slice(0, -6 )
      } 
      else{
        if( buffer.endsWith(',\n  { ') )
          buffer = buffer.slice(0, -6 )
      }
      buffer += `\n]`
    }      
   return buffer
  },
  mapObjToTableHTML( mapList, obj ){

    function callback( key, val, parent ){
      let result = null
      let map = objMapLib.findKey( key, parent )

      if( map.type === 'array' || map.type === 'object' ){    
        result = objMapLib.mapObjToTableHTML( map, val )
      }
      else{
        result =`<td>${String( val )}</td>`
      }      
      return result
    }
    function cbItem( key, val, itmidx, rowidx, parent ){  // iterating a two dimensional array 
      return callback( key, val, parent )   // parent = mapList.items[0]
    }
    function cbRow( itmList, rowidx, parent ){
      return `<tr>${itmList.join('')}</tr>\n`
    }

    // iterate
    let result = null 
    if( mapList.type === 'array' && mapList.arType !== '1d' ){
      result = this.iterateArr( obj, cbItem, cbRow, mapList.items[0] )
      result = result.join('')
    }
    else {
      result = this.iterateObj( obj, callback, mapList )
      result = `<tr>${result.join('')}</tr>\n`
    }

    // done
    let thlist = this.iterateObj( obj, key => `<th>${key}</th>` )
    
    return `<table>\n<thead>${thlist.join('')}</thead>\n<tbody>\n${result}</tbody></table>`
  },
  mapObjToTableJSX( mapList, obj ){
    let keyid = this.keyid

    function callback( key, val, parent ){
      let result = null
      let map = objMapLib.findKey( key, parent )
      let tmp = null

      if( map && (map.type === 'array' || map.type === 'object' )){
        tmp = objMapLib.mapObjToTableJSX( map, val )
      } 
      else {
        tmp = ( typeof val === 'string' 
              ? val
              : ( typeof tmp === 'object'
                ? json5.stringify( val )
                : String( val )
                )
              )
      }
        
      if( map ){
        result = (  
          <td key={++keyid} 
            data-id={map.id}
            data-lvl={map.lvl}
            data-selected={map.selected}
          > 
            { tmp }
          </td>
        )
      }
      else{
        result = (
          <td key={++keyid} 
            className='undefined'
            data-key={key}
            data-lvl='-1'
            title='Column contains inconsistent data structures'
          > 
            {tmp}
          </td>
        )
      }      
      return result
    }
    function cbItem( key, val, itmidx, rowidx, parent ){  // iterating a two dimensional array
      return callback( key, val, parent )    // parent = mapList.items[0]
    }
    function cbRow( itmList, rowidx, parent ){
      return <tr key={++keyid} >{itmList}</tr>
    }
    
    // iterate
    let parent = null
    let result = null 
    if( mapList.type === 'array' && mapList.arType !== '1d' && Array.isArray( obj ) === true ){
      // data may be inconsistent therefore test: Array.isArray( obj ) 
      parent = mapList.items[0]
      result = this.iterateArr( obj, cbItem, cbRow, parent )      
    }
    else {
      if( mapList.type !== 'array' )  // no th for simple arrays
        parent = mapList
      let tmp = this.iterateObj( obj, callback, mapList )
      result = <tr key={++keyid} >{tmp}</tr>
    }

    // done 
    let thlist = null
    if( parent !== null ){
      let tmp =  parent.items.map( map => (
        <th key={++keyid} 
//          data-lvl={map.lvl} 
//          data-type={map.type} 
        >{map.key}</th> 
      ))
      thlist = (
        <thead><tr key={++keyid} >
          { tmp }
        </tr></thead>
      )
    }

    return (
      <table key={++keyid} >
          { thlist }
        <tbody key={++keyid} >
          { result }
        </tbody>
      </table>
    )
  }
}

export default objMapLib
// module.exports = objMapLib