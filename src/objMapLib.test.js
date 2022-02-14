/*
  objMapLib.test.js
  - by Chris DeFreitas
  - tests casers for objMapLib.js

*/
var expect = require('chai').expect

/*
describe('test', () => {

  it(`TEST`, function() {
    expect( 1 === 1 ).to.equal( true )
  })

})
*/

describe.skip('Test simple objects', () => {

  it(`Test1 - object`, function() {
    let lib = require('./objMapLib')
    let obj = { a:1, b:2, c:3 }
    
    let mapList = lib.create( obj )
    
//    console.log( 'obj', obj )   
//    lib.mapListShow( mapList )
//    console.log( mapList )   

    expect( mapList.items.length ).to.equal( 3 )
    expect( mapList.items[ 0 ].id ).to.equal( 1 )
    expect( mapList.items[ 1 ].lvl ).to.equal( 1 )
    expect( mapList.items[ 2 ].key ).to.equal( 'c' )
  })

  it(`Test2 - array`, function() {
    let lib = require('./objMapLib')
    let obj = ['a','b','c']
    
    let mapList = lib.create( obj )
    
    // lib.mapListShow( mapList )
    // console.log( mapList )  
    
    expect( mapList.items.length ).to.equal( 3 )
    expect( mapList.items[ 0 ].id ).to.equal( 1 )
    expect( mapList.items[ 1 ].lvl ).to.equal( 1 )
    expect( mapList.items[ 2 ].key ).to.equal( '2' )
  })

  it(`Test3 - object with embedded object`, function() {
    let lib = require('./objMapLib')
    let obj = {
      a:1,
      b:2,
      c:3,
      d:{ aa:11, bb:22, cc:33 }
    }
    
    let mapList = lib.create( obj )
    
   // console.log( 'mapListShow: ' )
    // lib.mapListShow( mapList )
    // console.log( mapList.items[ 3 ] )   

    expect( mapList.items.length ).to.equal( 4 )
    expect( mapList.items[ 0 ].id ).to.equal( 1 )
    expect( mapList.items[ 1 ].lvl ).to.equal( 1 )
    expect( mapList.items[ 2 ].key ).to.equal( 'c' )
    expect( mapList.items[ 3 ].items.length ).to.equal( 3 )
  })

  it(`Test4 - array with embedded array`, function() {
    let lib = require('./objMapLib')
    let obj = ['a','b','c', [11,22,33]]
    
    let mapList = lib.create( obj )
    
   // console.log( 'mapListShow: ' )
    // lib.mapListShow( mapList )
    // console.log( mapList )  
    
    expect( mapList.items.length ).to.equal( 4 )
    expect( mapList.items[ 0 ].id ).to.equal( 1 )
    expect( mapList.items[ 1 ].lvl ).to.equal( 1 )
    expect( mapList.items[ 2 ].key ).to.equal( '2' )
    expect( mapList.items[ 3 ].items.length ).to.equal( 3 )
    expect( mapList.items[ 3 ].items[2].key ).to.equal( '2' )
  })

})

describe.skip('Test complex objects', () => {

  it(`Test5 - array of objects`, function() {
    let lib = require('./objMapLib')
    let obj = [
      { aa:1, bb:2, cc:3 },
      { aa:11, bb:22, cc:33 },
    ]
    
    let mapList = lib.create( obj )
    
//    console.log( 'obj: ', obj )
//    lib.mapListShow( mapList )
//    console.log( mapList )   

    expect( mapList.items.length ).to.equal( 1 )
    expect( mapList.items[ 0 ].id ).to.equal( 1 )
    expect( mapList.items[ 0 ].items[ 1 ].lvl ).to.equal( 1 )
    expect( mapList.items[ 0 ].items[ 2 ].key ).to.equal( 'cc' )
  })

  it(`Test6 - array of arrays`, function() {
    let lib = require('./objMapLib')
    let obj = [ [1,2,3], [11,22,33] ]
    
    let mapList = lib.create( obj )
    
//    console.log( 'obj', obj )
//    lib.mapListShow( mapList )
//    console.log( mapList.items[ 0 ].items[0] )  
    
    expect( mapList.items.length ).to.equal( 1 )
    expect( mapList.items[ 0 ].items.length ).to.equal( 3 )
    expect( mapList.items[ 0 ].items[0].lvl ).to.equal( 1 )
  })

  it(`Test7 - array of arrays with embedded obj`, function() {
    let lib = require('./objMapLib')
    let obj = [ [1,{a:1,b:2},3], [11,{a:11,b:22},33], [111,{a:111, b:222},333] ]
    
    let mapList = lib.create( obj )
    
//    console.log( 'obj', obj )
//    lib.mapListShow( mapList )
//    console.log( mapList )  
    
    expect( mapList.items.length ).to.equal( 1 )
    expect( mapList.items[ 0 ].id ).to.equal( 1 )
    expect( mapList.items[ 0 ].items.length ).to.equal( 3 )
    expect( mapList.items[ 0 ].items[0].key ).to.equal( '0' )
    expect( mapList.items[ 0 ].items[1].type ).to.equal( 'object' )
})

  it(`Test8 - array of objects with different keys`, function() {
    let lib = require('./objMapLib')
    let obj = [
      { aa:1, bb:2, cc:3 },
      { aa:11, bb:22, dd:44 },
      { aa:111, bb:222, ee:555 },
    ]
    
    let mapList = lib.create( obj )
    
//    console.log( 'obj: ', obj )
//    lib.mapListShow( mapList )
//    console.log( mapList )   

    expect( mapList.items.length ).to.equal( 1 )
    expect( mapList.items[0].items.length ).to.equal( 5 )
    expect( mapList.items[0].items[0].id ).to.equal( 2 )
    expect( mapList.items[0].items[0].lvl ).to.equal( 1 )
    expect( mapList.items[0].items[2].key ).to.equal( 'cc' )
    expect( mapList.items[0].items[4].key ).to.equal( 'ee' )
  })

})

describe.skip('Test mapObjTo...() - visualy inspect', () => {

  it(`Test9 - simple object`, function() {
    let lib = require('./objMapLib')
    let obj = { a:1, b:2, c:3 }
    
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapObjToText( mapList, obj )
    console.log( 'mapObjToText():\n', ss )  

    return true
  })
  
  it(`Test10 - simple array`, function() {
    let lib = require('./objMapLib')
    let obj = [ 1, 2, 3 ]
    
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapObjToText( mapList, obj )
    console.log( 'mapObjToText():\n', ss )  

    return true
  })

  it(`Test11 - array with embedded object`, function() {
    let lib = require('./objMapLib')
    let obj = [1,{a:1,b:2},3]    
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapObjToText( mapList, obj )
    console.log( 'mapObjToText():\n', ss )  
  })

  it(`Test12 - array of objects`, function() {
    let lib = require('./objMapLib')
    let obj = [
      { aa:1, bb:2, cc:3 },
      { aa:11, bb:22, cc:33 },
      { aa:111, bb:222, cc:333 },
    ]
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapObjToText( mapList, obj )
    console.log( 'mapObjToText():\n', ss )
//    console.log( 'mapList', mapList )
  })

  it(`Test13 - array of arrays`, function() {
    let lib = require('./objMapLib')
    let obj = [ [1,2,3], [11,22,33], [111,222,333] ]
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapObjToText( mapList, obj )
    console.log( 'mapObjToText():\n', ss )
//    console.log( 'mapList', mapList )
  })

  it(`Test14 - simple object to HTML table`, function() {
    let lib = require('./objMapLib')
    let obj = { a:1, b:2, c:3 }
    
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapObjToTableHTML( mapList, obj )
    console.log( 'mapObjToTableHTML():\n', ss )  

    return true
  })

  it(`Test15 - array of arrays to HTML table`, function() {
    let lib = require('./objMapLib')
    let obj = [ [1,2,3], [11,22,33], [111,222,333] ]
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapObjToTableHTML( mapList, obj )
    console.log( 'mapObjToTableHTML():\n', ss )
//    console.log( 'mapList', mapList )
  })

})

describe('Test mapListToTableHTML() - visualy inspect', () => {

  it(`Test16 - simple object`, function() {
    let lib = require('./objMapLib')
    let obj = { a:1, b:2, c:3 }
    
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapListToTableHTML( mapList, obj )
    console.log( 'mapListToTableHTML():\n', ss )
  })

  it(`Test17 - array of arrays with embedded obj`, function() {
    let lib = require('./objMapLib')
    let obj = [ [1,{a:1,b:2},3], [11,{a:11,b:22},33], [111,{a:111, b:222},333] ]
    
    let mapList = lib.create( obj )
    
    console.log( 'obj', obj )
    let ss = lib.mapListToTableHTML( mapList )
    console.log( 'mapListToTableHTML:', ss )  
   })

})