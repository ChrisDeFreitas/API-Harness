/*
APIForm.jsx
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com

*/

import React from 'react'
import './APIForm.sass'
import EditBox from'./EditBox'
import q from'./lib.js'

// manually incrementing keyid forces react to repaint
let urlKeyId = 0  // inc on url param change
let hdKeyId = 0   // inc on new header
let qryKeyId = 0  // inc on new query line
              
class APIForm extends React.Component{

  constructor (props) {
    // console.log('APIForm.constructor()', props)
    super(props)

    this.cache = q.url.parse('https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=522fdc88c5fec5c9f9598045831f4a42&tags=beach&format=json&nojsoncallback=1')
    this.cache.header = ['']
    this.cache.qList = q.query.parse( this.cache.query )
    this.state  = {
      mode: 'Settings',   //one of: Settings, Log, Result
      ...this.cache,
      header: [ ...this.cache.header ],
      qList: [ ...this.cache.qList ],
      log:'Log, still testing',
      result:'Result, still testing'
    }
    
    this.autoFocus = ''
    this.autoFocusRef = React.createRef()

    this.ctrlChange = this.ctrlChange.bind( this )
    this.getCacheVal = this.getCacheVal.bind( this )
    this.modeChange = this.modeChange.bind( this )
    this.multiHandler = this.multiHandler.bind( this )
  }

  // shouldComponentUpdate(nextProps, nextState){}
  componentDidUpdate(prevProps, prevState, snapshot){
    if(this.autoFocus === '') return
    this.autoFocusRef.current.focus()
    this.autoFocus = ''
  }

  ctrlChange( colname, val, active, multi ){
    if(colname === undefined){
      throw new Error( 'APIForm.ctrlChange() error, colname === undefined.' )
    }
    
    if(colname === 'url'){
      let uobj = q.url.parse( val )
      qryKeyId++
      this.setState({
        qList: q.query.parse( uobj.query )    // list of parse query strings
      })
    } else
    if(colname === 'header'){
      let list = [ ...this.state.header ]
      list[ multi -1 ] = ( active === 'active' ?val :'' )
      this.setState({ header:list })
    } else
    if(colname === 'query'){
      let list = [ ...this.state.qList ]
      list[ multi -1 ] = ( active === 'active' ?val :'' )
      let url = q.url.join( this.state, list )

      // qryKeyId++
      urlKeyId++
      this.setState({ 
        qList:list,
        url:url 
      })
    } else
    if( this.cache[colname] !== undefined ){
      // make new url
      let state = { ...this.state }
      state[colname] = ( active === 'active' ?val :'' )
      state['url'] = q.url.join( state, this.state.qList )

      
      //update state
      let obj = { url:state['url'] }
      obj[ colname ] = state[colname]
      urlKeyId++
      this.setState( obj )
    }
  }
  getCacheVal( colname, multi ){
    if(colname === undefined)
      throw new Error( 'APIForm.getCacheVal() error, colname === undefined.' )

    if(colname === 'header'){
      let idx = multi -1
      if(idx >= this.cache.header.length)
        return ''
      return this.cache.header[ idx ]
    } else
    if(colname === 'query'){
      let idx = multi -1
      if(idx >= this.cache.qList.length)
        return ''
      return this.cache.qList[ idx ]
    } else
    if( this.cache[colname] !== undefined ){
      return this.cache[colname]
    }

    return null
  }
  modeChange( event ){
    let mode = event.target.dataset.mode
    // renderNum++
    this.setState({ mode:mode })
  }
  multiHandler( event ){    //splice empty line into specified dataset
    let ctrl = event.target,
      colname = ctrl.dataset.colname,
      multi = Number( ctrl.dataset.multi )
      
    // console.log( 'multi', colname, multi )
    
    if( colname === 'header' ){
      this.cache.header = q.insertInList( this.cache.header, multi, '' )  //mirror in cache
      let list = q.insertInList( this.state.header, multi, '' )
      this.autoFocus = 'Editheader' +( multi +1)
      hdKeyId++
      this.setState({ header:list })
    } else
    if( colname === 'query' ){
      this.cache.qList = q.insertInList( this.cache.qList, multi, '' )  //mirror in cache
      let qList = q.insertInList( this.state.qList, multi, '' )
      this.autoFocus = 'Editquery' +( multi +1)
      qryKeyId++
      this.setState({ qList:qList })
    }
    else
      throw new Error( `APIForm.multiHandler() error, unknown colname received: [${colname}].`)
  }

  // create jsx
  getHeader(){
    let state = this.state
    return (
      <>
        <div className='frmPanel'>
          <EditBox key={ urlKeyId +'url' } 
            canDisable={false} 
            colname='url' 
            heading='URL' 
            rows={5} 
            value={state.url} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
          />
          <div className='frmButtonbar'>
            <button disabled >Exec</button>
          </div>
        </div>
      </>      
    )
  }
  getModeBar( mode ){
    return(
      <div className='modebar' >
        <span onClick={this.modeChange} data-mode='Settings' className={mode === 'Settings' ?'selected' :null} >Settings</span>
        <span onClick={this.modeChange} data-mode='Log' className={mode === 'Log' ?'selected' :null} >Log</span>
        <span onClick={this.modeChange} data-mode='Result' className={mode === 'Result' ?'selected' :null} >Result</span>
      </div>
    )
  }

  render(){
    if(this.state.mode === 'Settings')
      return this.renderSettings()
    if(this.state.mode === 'Log')
      return this.renderLog()
    if(this.state.mode === 'Result')
      return this.renderResult()
  }
  renderSettings(){
    let state = this.state
    // console.log('keyid', urlKeyId, hdKeyId, qryKeyId, this.state )

    let hControls = []
    this.state.header.forEach( ( str, idx ) => {
      let multi = idx+1,
        id = 'Editheader' + multi
      hControls.push(
        <EditBox key={ hdKeyId +'header' +idx} ref={ this.autoFocus===id ?this.autoFocusRef :null }
          colname='header' 
          heading={ 'Header ' +multi } 
          value={ str }
          multi={ multi }
          multiHandler={ this.multiHandler }
          onChange={ this.ctrlChange }
          getCacheVal={ this.getCacheVal }
        />
      )
    })

    let qListControls = []
    this.state.qList.forEach( ( str, idx ) => {
      let multi = idx+1,
        id = 'Editquery' +multi
      qListControls.push(
        <EditBox key={ qryKeyId +'query' +idx} ref={ this.autoFocus===id ?this.autoFocusRef :null }
          colname='query' 
          heading={ 'Query ' +( multi ) } 
          value={ str } 
          multi={ multi } 
          multiHandler={ this.multiHandler } 
          onChange={ this.ctrlChange }
          getCacheVal={ this.getCacheVal }
        />
      )
    })

    return (
      <form className='apiForm' >
        { this.getHeader() }
        <div className='frmPanel'>
          { this.getModeBar('Settings') }
          { hControls }
          <EditBox 
            colname='protocol' 
            value={state.protocol} 
            heading='Protocol' 
            title='http or https'
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
          />
          <EditBox 
            colname='host' 
            heading='Host' 
            value={this.state.host} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
           />
           <EditBox 
            colname='port' 
            heading='Port' 
            value={this.state.port} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
           />
          <EditBox 
            colname='path' 
            heading='Path' 
            value={this.state.path} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
          />
          { qListControls }
          <EditBox 
            colname='hash' 
            heading='Hash' 
            value={this.state.hash} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
          />         
        </div>
      </form>
    )
  }
  renderLog(){
    return (
      <form className='apiForm' >
        { this.getHeader() }
        <div className='frmPanel'>
          { this.getModeBar( 'Log' ) }
          <textarea key='log' ref={ this.autoFocus==='Editlog' ?this.autoFocusRef :null }
            className='logText'
            id='log'
            readOnly
            rows={12}
            value={ this.state.log }
            wrap='off'
          />
        </div>
      </form>
    )
  }
  renderResult(){
    return (
      <form className='apiForm' >
        { this.getHeader() }
        <div className='frmPanel'>
          { this.getModeBar( 'Result' ) }
          <textarea key='result' ref={ this.autoFocus==='Editlog' ?this.autoFocusRef :null }
            className='resultText'
            id='result'
            readOnly
            rows={12}
            value={ this.state.log }
            wrap='off'
          />
        </div>
      </form>
    )
  }
}

export default APIForm