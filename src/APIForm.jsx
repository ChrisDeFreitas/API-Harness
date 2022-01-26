/*
APIForm.jsx
  - by Chris DeFreitas

  Goals:
  - make api calls
  - analyze results and erros
  - break apart URL parameters for simple editing
  -- specify port, protocol, host, path, hash
  -- add/edit headers
  -- add/edit query params
  - cache queries
  - store notes
  - not suported url.username, url.password

  local cache allows reload function in ui
  - this.cache.byID( this.cacheitm.id )
  - this.uobj
  
  working data stores current values of global cache item:
  - this.cacheitm
  - this.state...
*/

import React from 'react'
import ReactJson from 'react-json-view'
import XMLViewer from 'react-xml-viewer'

import './APIForm.sass'
import EditBox from'./EditBox'
import png from './resources/satelite-outline.png'

import q from'./public.js'
import cache from'./cache.js'

// manually incrementing keyid forces React to repaint components
// required because data changed from different locations
let cacheKeyId = 0  // inc to force name,notes repaint
let urlKeyId = 0  // inc to force URL repaint
let hdKeyId = 0   // inc to force Header lines repaint
let colKeyId = 0  // inc to force URL component repaint
let qryKeyId = 0  // inc to force Query lines repaint

class APIForm extends React.Component{

  constructor (props) {
    super(props)
    console.log('APIForm.constructor()', props)
    console.log( props.cacheitm )
    
    // ToDo:,just pass ID as props.cacheitm is not used after this
    // this.cacheitm is working data: url, notes, headers
    this.cacheitm = { ...props.cacheitm }
    this.cacheitm.headers = [ ...props.cacheitm.headers ]
    if( this.cacheitm.headers.length === 0 ) this.cacheitm.headers.push('')

    // cache URL components
    this.uobj = q.url.parse( this.cacheitm.url )   
    this.uobj.qList = q.query.parse( this.uobj.query )
    if( this.uobj.qList.length === 0 ) this.uobj.qList.push('')

    this.state  = {
      mode: 'Edit',   // one of: Cache, Edit, Log, Result
      execMode: 'Wait',   // one of: Wait, Exec, Done
      resultType:'Text',  // one of: Text, JSON, XML

      // working data
      ...this.uobj,       
      qList: [ ...this.uobj.qList ],  
      log:'',
      resultData:''
    }
      
    this.autoFocus = ''
    this.autoFocusRef = React.createRef()
    this.pngRef = React.createRef()
    this.logRef = React.createRef()
    this.resultRef = React.createRef()
    
    this.apiTimer = 0   //time requests
    this.controller = new AbortController()
    this.logNum = 0
    
    this.fetch = this.fetch.bind( this )
    this.fetchCallback = this.fetchCallback.bind( this )
    this.fetchCancel = this.fetchCancel.bind( this )
    
    this.ctrlChange = this.ctrlChange.bind( this )
    this.getStoredVal = this.getStoredVal.bind( this )
    this.modeChange = this.modeChange.bind( this )
    this.multiHandler = this.multiHandler.bind( this )
    this.setResultType = this.setResultType.bind( this )
    this.openBrowserTabEvent = this.openBrowserTabEvent.bind( this )
  
    this.cachePrior = this.cachePrior.bind( this )
    this.cacheNext = this.cacheNext.bind( this )
    this.cacheUpdate = this.cacheUpdate.bind( this )
    this.cacheLoad = this.cacheLoad.bind( this )
  }

// shouldComponentUpdate(nextProps, nextState){}
  componentDidUpdate(prevProps, prevState, snapshot){
    if(this.state.execMode === 'Exec') 
      this.pngRef.current.classList.add('pngIconSpin' )
    else
    if( this.pngRef.current != null )
      this.pngRef.current.classList.remove('pngIconSpin' )

    if(this.autoFocus === '') return
    this.autoFocusRef.current.focus()
    this.autoFocus = ''
  }

  //
  fetch( event ){
    event.preventDefault()
    let headers = this.cacheitm.headers

    this.controller = new AbortController()
    let str = this.cacheitm.url
    if( headers.length > 0
    &&( !( headers.length === 1 && headers[0].trim() === '' )))
      str += '\nHeaders:\n' +headers.join( '\n' )

    this.logWrite( 'Exec lib.fetch() with:', str, true )
    this.setState({ 
      resultData:'',
      resultType:'Text',
      mode:'Log',
      execMode: 'Exec'
    })

    this.apiTimer = performance.now()
    q.fetch(
      this.cacheitm.url, 
      this.controller.signal,
      this.fetchCallback, 
      headers,
      true 
    )
  }
  fetchCallback( type, obj, debug ){
    if( type === 'progress' ){    // obj = { num, ms, current, total }
      let pcent = (obj.total === 0 ?'' : `, ${ obj.current /obj.total *100 }%` )
      this.logWrite( 
        `Progress #${obj.num}: ${q.bytesToStr( obj.current )}${pcent}, ${obj.ms}ms`
      )
    } else
    if( type === 'response' ){    // obj = Response object
      this.apiTimer = performance.now() -this.apiTimer
      this.controller = null
      let data = obj.data

      this.logWrite( 'Status: ' +obj.status +' ' +obj.statusText )
      this.logWrite( 'Server URL: ' +obj.url )
      this.logWrite( 'Response Type: ' +obj.type )
      this.logWrite( 'Response Redirected: ' +obj.redirected )
      this.logWrite( 'Duration: ' +this.apiTimer +'ms' )
      this.logWrite( 'Debug: ' +debug )
      // Response.trailers
      this.logWrite( 'Data size: ' +q.bytesToStr( obj.dataLength ))
      this.logWrite( 'Response:', data )
      this.resultWrite( data )
    } else
    if( type === 'error' ){   // obj = Response || TypeError event
      this.apiTimer = performance.now() -this.apiTimer
      this.controller = null

      if( obj.status ){     // obj = TypeError event
        this.logWrite( 'Server error:', 'Status ' +obj.status +', ' +obj.statusText )
      } 
      else{     // obj = error event
        this.logWrite( 'Network error (details not available to scripts by design):', obj.message
          +`\n- Ctrl+Shift+i to review Javascript console.`
          +`\n- CORS errors may be due to:`
          +`\n  1. server's request filtering`
          +`\n  2. an error in a URL parameter`
          +`\n  Open URL in browser to view API server's response.`
        )
      }
  
      this.logWrite( 'Duration: ' +this.apiTimer +'ms' )
      this.logWrite( 'Debug: ' +debug )
      this.setState({ 
        resultData:'Error',
        resultType:'Text',
        mode:'Log',
        execMode:'Done' 
      })
    }
    else
      throw new Error( `APIForm.fetchCallback() error, unknown type received: [${type}].` )
  }
  fetchCancel( event ){
    event.preventDefault()
    if( this.state.execMode !== 'Exec' || this.controller === null ) return

    this.apiTimer = performance.now() -this.apiTimer
    this.controller.abort()
    this.controller = null

    this.logWrite( 'Execution cancelled by user.' )
    this.logWrite( 'Duration: ' +this.apiTimer +'ms' )
    this.setState({ 
      resultData:'Execution cancelled by user.',
      resultType:'Text',
      mode:'Log',
      execMode:'Done',
    })
  }
  logWrite( head, str = '', reset = false ){
    
    let buf = ''
    if( reset === true )
      this.logNum = 0
    else
      buf = this.state.log.substring( 0 )

    this.logNum++
    let newstr = `${this.logNum}. ${head}${str !== '' ?'\n'+str+'\n' :'\n'}`

    if( this.logRef.current != null ){   //append to textarea
       let max = this.logRef.current.maxLength
       if(reset)
        this.logRef.current.value = newstr
      else
        this.logRef.current.setRangeText( newstr, max, max )
    }

    str = buf +newstr
    this.setState({ log:str })
  }
  resultWrite( result ){
    let type = 'text'
    if( typeof result === 'object' || result[0] === '{' || result[0] === '[')
      type = 'JSON'
    else
    if( result.trim()[0] === '<' )
      type = 'XML'

    this.setState({ 
      resultData:result,
      resultType:type,
      mode:'Result',
      execMode:'Done' 
    })
  }

  cacheToState( cacheitm ){
    cacheKeyId++// force name,notes repaint
    urlKeyId++  // force URL repaint
    hdKeyId++   // force Headers repaint
    colKeyId++  // force URL components repaint
    qryKeyId++  // force Query lines repaint

    // working data
    this.cacheitm = { ...cacheitm }
    this.cacheitm.headers = [ ...cacheitm.headers ]
    if( this.cacheitm.headers.length === 0) this.cacheitm.headers.push('')

    // cache data
    this.uobj = q.url.parse( this.cacheitm.url )
    this.uobj.qList = q.query.parse( this.uobj.query )
    if( this.uobj.qList.length === 0) this.uobj.qList.push('')

    // update state
    this.setState({ 
      execMode: 'Wait',
      resultType: 'Text', 

      // working data      
      ...this.uobj,
      qList: [ ...this.uobj.qList ],
      log:'',
      resultData:'',
    })
  }
  cachePrior(event){ 
    let itm = cache.prior( this.cacheitm )
    if( itm === null ) itm = cache.last()

    this.cacheToState( itm )
  }
  cacheNext(event){ 
    let itm = cache.next( this.cacheitm )
    if( itm === null ) itm = cache.first()

    this.cacheToState( itm )
  }
  cacheUpdate(event){
    let itm = cache.update( this.cacheitm )
    this.cacheitm = itm
  }
  cacheLoad(event){
    let itm = cache.byID( this.cacheitm.id )
    this.cacheToState( itm )
  }

  ctrlChange( colname, val, active, multi ){
    if(colname === undefined){
      throw new Error( 'APIForm.ctrlChange() error, colname === undefined.' )
    }
    
    if(colname === 'name'){
      this.cacheitm.name = val    // update working data
      this.forceUpdate()          // redraw modeBar
    } else
    if(colname === 'notes'){
      this.cacheitm.notes = val   // update working data
    } else
    if(colname === 'url'){   
      // update working data
      this.cacheitm.url = val
      this.uobj = q.url.parse( val )
      this.uobj.qList = q.query.parse( this.uobj.query )
      if( this.uobj.qList.length === 0) this.uobj.qList.push('')
      
      // update state
      qryKeyId++
      colKeyId++
      this.setState({
        ...this.uobj,
        qList: [ ...this.uobj.qList ]
      })
    } else
    if(colname === 'header'){
      this.cacheitm.headers[ multi -1 ] = ( active === 'active' ?val :'' )
    } else
    if(colname === 'query'){
      // make new url
      let list = [ ...this.state.qList ]
      list[ multi -1 ] = ( active === 'active' ?val :'' )   //update query item
      this.cacheitm.url = q.url.join( this.state, list )
      
      // update state
      urlKeyId++
      this.setState({ qList:list })
    } else
    if( this.uobj[colname] !== undefined ){
      // make new url
      let state = { ...this.state }
      state[colname] = ( active === 'active' ?val :'' )     //update url component
      this.cacheitm.url = q.url.join( state, this.state.qList )
      
      //update state
      urlKeyId++
      let obj = {}
      obj[ colname ] = state[colname]
      this.setState( obj )
    }
  }
  getStoredVal( colname, multi ){
    if(colname === undefined)
      throw new Error( 'APIForm.getStoredVal() error, colname === undefined.' )

    if(colname === 'name'){
      let itm = cache.byID( this.cacheitm.id )
      return itm.name
    } else
    if(colname === 'notes'){
      let itm = cache.byID( this.cacheitm.id )
      return itm.notes
    } else
    if(colname === 'header'){   
      // ToDo: algorithm will fail is line inserted between old items
      // requires an id assigned to each line
      let itm = cache.byID( this.cacheitm.id )
      let idx = multi -1
      if(idx >= itm.headers.length)
        return ''
      return itm.headers[ idx ]
    } else
    if(colname === 'query'){
      let idx = multi -1
      if(idx >= this.uobj.qList.length)
        return ''
      return this.uobj.qList[ idx ]
    } else
    if( this.uobj[colname] !== undefined ){
      return this.uobj[colname]
    }

    return null
  }
  modeChange( event ){
    let mode = event.target.dataset.mode
    this.setState({ mode:mode })
  }
  multiHandler( event ){    //splice empty line into specified dataset
    let ctrl = event.target,
      colname = ctrl.dataset.colname,
      multi = Number( ctrl.dataset.multi )
      
    // console.log( 'multi', colname, multi )
    
    if( colname === 'header' ){
      this.cacheitm.headers = q.insertInList( this.cacheitm.headers, multi, '' )  //mirror in cache
      let list = q.insertInList( this.cacheitm.headers, multi, '' )
      this.autoFocus = 'Editheader' +( multi +1)
      hdKeyId++
      this.setState({ headers:list })
    } else
    if( colname === 'query' ){
      this.uobj.qList = q.insertInList( this.uobj.qList, multi, '' )  //mirror in cache
      let qList = q.insertInList( this.state.qList, multi, '' )
      this.autoFocus = 'Editquery' +( multi +1)
      qryKeyId++
      this.setState({ qList:qList })
    }
    else
      throw new Error( `APIForm.multiHandler() error, unknown colname received: [${colname}].`)
  }
  setResultType( event ){
    event.preventDefault()
    if( !event.target.dataset.type ) return
    this.setState({ resultType:event.target.dataset.type })
  }
  openBrowserTabEvent( event ){
    window.open( this.cacheitm.url, '_blank' )
  }

  // create jsx
  getModeBar( mode ){
    let cacheitm = this.cacheitm
    return(
      <div className='modeBar' >
        <label>{cacheitm.id +'. ' +this.cacheitm.name}</label>
        <span onClick={this.modeChange} data-mode='Cache' className={mode === 'Cache' ?'selected' :null} >Cache</span>
        <span onClick={this.modeChange} data-mode='Edit' className={mode === 'Edit' ?'selected' :null} >Edit</span>
        <span onClick={this.modeChange} data-mode='Log' className={mode === 'Log' ?'selected' :null} >Log</span>
        <span onClick={this.modeChange} data-mode='Result' className={mode === 'Result' ?'selected' :null} >Result</span>
      </div>
    )
  }
  getHeader(){
    let cacheitm = this.cacheitm
    return (
      <>
        <div className='frmPanel frmHeader '>
          <EditBox key={ cacheKeyId +'notes' } ref={ this.autoFocus==='Editnotes' ?this.autoFocusRef :null }
            canDisable={false} 
            colname='notes' 
            value={cacheitm.notes} 
            heading='Notes' 
            readOnly={false} 
            rows={1}
            title='Name this query for quick reference'
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          />
          <EditBox key={ urlKeyId +'url' } 
            canDisable={false} 
            colname='url' 
            heading='URL' 
            readOnly={this.state.mode !== 'Edit'} 
            rows={3} 
            value={cacheitm.url} 
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          >
            <span className='cacheBar' title={`Viewing: ${cacheitm.name}`}>
              <span onClick={this.cachePrior} className="material-icons btnIcon btnCacheArrow" title='Load prior query'>arrow_left</span> 
              <span onClick={this.cacheLoad} className='queryLabel' title='Reload from Cache'>Query ID: {cacheitm.id}</span>
              <span onClick={this.cacheNext} className="material-icons btnIcon btnCacheArrow" title='Load next query'>arrow_right</span> 
              &nbsp; &nbsp; 
              <span className="material-icons btnIcon btnIconDisabled" title='Save as new query'>add_to_queue</span> 
              <span onClick={this.cacheUpdate} className="material-icons btnIcon" title='Update this query'>browser_updated</span> 
              <span className="material-icons btnIcon btnIconDisabled" title='Delete query'>remove_from_queue</span> 
            </span>
            { this.state.execMode !== 'Exec' 
              && <button onClick={this.fetch} >Exec</button> }
            { this.state.execMode === 'Exec' 
              && <button onClick={this.fetchCancel} >Cancel</button> }
            &nbsp; &nbsp; 
            <span onClick={this.openBrowserTabEvent} className="material-icons btnIcon" title='Open in browser'>open_in_browser</span> 
          </EditBox>
          <img src={png} ref={ this.pngRef } className='pngIcon' alt='' ></img>
          { this.state.execMode === 'Exec'  
              && <button className='btnFetchCancel' onClick={this.fetchCancel} >Cancel</button> }
        </div>
      </>      
    )
  }

  render(){
    if(this.state.mode === 'Cache')
      return this.renderCache()
    if(this.state.mode === 'Edit')
      return this.renderEdit()
    if(this.state.mode === 'Log')
      return this.renderLog()
    if(this.state.mode === 'Result')
      return this.renderResult()
  }
  renderCache(){
    let cacheitm = this.cacheitm
    return (
      <form className='apiForm' >
        { this.getModeBar( 'Cache' ) }
        <div className='frmPanel frmCache'>
          <div className='queryBar' >
            <span className='cacheBar' title={`Viewing: ${cacheitm.name}`}>
              <span onClick={this.cachePrior} className="material-icons btnIcon btnCacheArrow" title='Load prior query'>arrow_left</span> 
              <span onClick={this.cacheLoad} className='queryLabel' title='Reload from Cache'>Query ID: {cacheitm.id}</span>
              <span onClick={this.cacheNext} className="material-icons btnIcon btnCacheArrow" title='Load next query'>arrow_right</span> 
              &nbsp; &nbsp; 
              <span className="material-icons btnIcon btnIconDisabled" title='Save as new query'>add_to_queue</span> 
              <span onClick={this.cacheUpdate} className="material-icons btnIcon" title='Update this query'>browser_updated</span> 
              <span className="material-icons btnIcon btnIconDisabled" title='Delete query'>remove_from_queue</span> 
            </span>
            { this.state.execMode !== 'Exec' && <button onClick={this.fetch} >Exec</button> }
            { this.state.execMode === 'Exec' && <button onClick={this.fetchCancel} >Cancel</button> }
            &nbsp; &nbsp;
            <span onClick={this.openBrowserTabEvent} className="material-icons btnIcon" title='Open in browser'>open_in_browser</span> 
          </div>
          <EditBox key={ cacheKeyId+'name' } ref={ this.autoFocus==='Editname' ?this.autoFocusRef :null }
            canDisable={false} 
            colname='name' 
            value={cacheitm.name} 
            heading='Name' 
            title='Name this query for quick reference'
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          />
          <EditBox key={ cacheKeyId+'notes' } ref={ this.autoFocus==='Editnotes' ?this.autoFocusRef :null }
            canDisable={false} 
            colname='notes' 
            value={cacheitm.notes} 
            heading='Notes' 
            rows={3} 
            title=''
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          />
          <EditBox key={ cacheKeyId+'url' } 
            canDisable={false} 
            colname='url' 
            value={cacheitm.url} 
            heading='URL' 
            rows={3} 
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          />
        </div>
      </form>
    )
  }
  renderEdit(){
    let state = this.state

    let hControls = []
    this.cacheitm.headers.forEach( ( str, idx ) => {
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
          getStoredVal={ this.getStoredVal }
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
          getStoredVal={ this.getStoredVal }
        />
      )
    })

    return (
      <form className='apiForm' >
        { this.getModeBar('Edit') }
        { this.getHeader() }
        <div className='frmPanel frmData frmEdit'>
          { hControls }
          <EditBox key={ colKeyId +'protocol' } 
            colname='protocol' 
            value={state.protocol} 
            heading='Protocol' 
            title='http or https'
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          />
          <EditBox key={ colKeyId +'host' } 
            colname='host' 
            heading='Host' 
            value={this.state.host} 
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
           />
           <EditBox key={ colKeyId +'port' } 
            colname='port' 
            heading='Port' 
            value={this.state.port} 
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
           />
          <EditBox key={ colKeyId +'path' } 
            colname='path' 
            heading='Path' 
            value={this.state.path} 
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          />
          { qListControls }
          <EditBox key={ colKeyId +'hash' } 
            colname='hash' 
            heading='Hash' 
            value={this.state.hash} 
            onChange={this.ctrlChange}
            getStoredVal={ this.getStoredVal }
          />         
        </div>
      </form>
    )
  }
  renderLog(){
    return (
      <form className='apiForm' >
        { this.getModeBar( 'Log' ) }
        { this.getHeader() }
        <div className='frmPanel frmData'>
          <textarea key='log' ref={ this.logRef }
            className='logText'
            id='log'
            readOnly
            rows={28}
            defaultValue={ this.state.log }
            wrap='off'
          />
        </div>
      </form>
    )
  }
  renderResult(){
    let resultData = this.state.resultData
    let resultType = this.state.resultType
    let isJSON = (
      typeof resultData === 'object'
      || resultData[0] === '{'  
      || resultData[0] === '[' 
    )
    let isXml = (
      typeof resultData !== 'object' 
      && resultData.trim()[0] === '<'
    )
    return (
      <form className='apiForm' >
        { this.getModeBar( 'Result' ) }
        { this.getHeader() }
        <div className='frmPanel frmData' >
          <div className='resultBar' >
            <button onClick={this.setResultType} data-type='Text' 
              className={ resultType === 'Text' ?'selected' :''} >Text</button>
            {isJSON 
            && <button onClick={this.setResultType} data-type='JSON' 
                className={ resultType === 'JSON' ?'selected' :''}  >JSON</button> }
            {isXml 
            && <button onClick={this.setResultType} data-type='XML'  
              className={ resultType === 'XML' ?'selected' :''} >XML</button> }
            <button onClick={this.setResultType} data-type='Grid'  
              disabled
              className={ resultType === 'Grid' ?'selected' :''} >Grid</button> 
          </div>
          { resultType === 'Text' 
          && <textarea key='resulttext' ref={ this.resultRef }
              className='resultText'
              readOnly
              defaultValue={ typeof resultData === 'object'
              ? JSON.stringify( resultData, null, 3 )
              : resultData 
              }
              wrap='on'
            />
          }
          { resultType === 'JSON'  
          && <div className='resultJSON' >
              <ReactJson key='resultjson'
                src={ typeof resultData === 'object'
                  ? resultData
                  : JSON.parse( resultData )
                }
                name={ null }
                style={{
                  textAlign:'left'
                }}
                // theme='grayscale:inverted'
                iconStyle='triangle'
                indentWidth={ 3 }
                collapsed={ 3 }
                enableClipboard={ false }
                displayObjectSize={ false }
                displayDataTypes={ false }
                sortKeys={ false }
                quotesOnKeys={ false }
                displayArrayKey={ true }
              />
            </div>
          }
          { resultType === 'XML'  && 
            <div className='resultXML' >
              <XMLViewer key='resultxml'
                xml={ resultData }
                indentSize={ 3 }
                collapsible={ true }
              />
            </div>
          }
          {/* { resultType === 'XML'  && <textarea key='resultxml' ref={ this.resultRef }
            className='resultXML'
            readOnly
            defaultValue={ resultData }
            wrap='off'
          />} */}
        </div>
      </form>
    )
  }
}

export default APIForm