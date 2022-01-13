/*
  test lib.js functions
  - test suite used for initial concept development

*/
'use strict'

import q from "./lib.js";

const url = 'https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=522fdc88c5fec5c9f9598045831f4a42&tags=beach&format=json&nojsoncallback=1'
let uobj = q.url.parse( url )
uobj.qList = q.query.parse( uobj.query )
// console.log( 111, uobj )

describe('test q.api', () => {
  // see testAxiosConsole.js
  return true
})
describe('test q.insertInList', () => {
  it("qList[0] === xxx ", () => {
    let qList = q.insertInList( uobj.qList, 0, 'xxx')
    expect( uobj ).toBeTruthy()
    expect( qList[0] ).toBe( 'xxx' )
  })
  it("qList[last] === xxx ", () => {
    let qList = q.insertInList( uobj.qList, uobj.qList.length, 'xxx')
    expect( uobj ).toBeTruthy()
    expect( qList[ uobj.qList.length ] ).toBe( 'xxx' )
  })
  it("qList[1] === xxx ", () => {
    let qList = q.insertInList( uobj.qList, 1, 'xxx')
    expect( uobj ).toBeTruthy()
    expect( qList[ 1 ] ).toBe( 'xxx' )
  })
})
describe('test q.url.parse()', () => {
  it("expect q.url.parse( url ).url === url ", () => {
  
    expect( uobj ).toBeTruthy()
    expect( uobj.url ).toBe( url )
    expect( uobj.protocol ).toBe( 'https' )
  })
})
describe('test q.url.join()', () => {
  it('{host:"xx.com", path:"a/b/c"}', () => {
    let url = q.url.join( {host:"xx.com", path:"a/b/c"})
    expect( url ).toBeTruthy()
    expect( url ).toBe( '//xx.com/a/b/c' )
  })
  it('{protocol:"https:", user:"bill", host:"xx.com", query:"aaa&bbb", fragment:"fragment"}', () => {
    let url = q.url.join( {protocol:"https:", user:"bill", host:"xx.com", query:"aaa&bbb", fragment:"fragment"})
    expect( url ).toBeTruthy()
    expect( url ).toBe( 'https:://bill@xx.com?aaa&bbb#fragment' )
  })
  it('{host:"xx.com", port:80}, ["aaa","bbb"]', () => {
    let url = q.url.join( {host:"xx.com", port:80}, ["aaa","bbb"] )
    // console.log( 222, url )
    expect( url ).toBeTruthy()
    expect( url ).toBe( '//xx.com:80?aaa&bbb' )
  })
})
