/*
APIForm.jsx
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com

*/

import React from 'react'
import ReactJson from 'react-json-view'
import XMLViewer from 'react-xml-viewer'

import './APIForm.sass'
import EditBox from'./EditBox'
import png from './resources/satelite-outline.png'

import q from'./lib.js'
import cache from'./cache.js'

// manually incrementing keyid forces react to repaint
let urlKeyId = 0  // inc on url param change
let hdKeyId = 0   // inc on new header
let colKeyId = 0  // inc on column change
let qryKeyId = 0  // inc on new query line
              
class APIForm extends React.Component{

  constructor (props) {

    super(props)
    console.log('APIForm.constructor()', props)
    console.log( props.cacheitm )
    
    //this.cacheitm = props.cacheitm

    this.uobj = q.url.parse(  props.cacheitm.url  )   // local cache
    this.uobj.headers = props.cacheitm.headers.slice()
  //  this.uobj.disabled = JSON.parse(JSON.stringify( props.cacheitm.disabled ))
    this.uobj.qList = q.query.parse( this.uobj.query )
    if( this.uobj.headers.length === 0) this.uobj.headers.push('')
    if( this.uobj.qList.length === 0) this.uobj.qList.push('')

    this.state  = {
      cacheitm: props.cacheitm,
      mode: 'Settings',   //one of: Settings, Log, Result, Exec
      ...this.uobj,
      headers: [ ...this.uobj.headers ],
      qList: [ ...this.uobj.qList ],
      log:'',
      resultData:'',
      resultType:'Text'   //one of: Text, JSON, XML
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
    // this.apiAjaxCallback = this.apiAjaxCallback.bind( this )
    this.fetchCallback = this.fetchCallback.bind( this )
    this.fetchCancel = this.fetchCancel.bind( this )

    this.ctrlChange = this.ctrlChange.bind( this )
    this.getCacheVal = this.getCacheVal.bind( this )
    this.modeChange = this.modeChange.bind( this )
    this.multiHandler = this.multiHandler.bind( this )

    this.setResultType = this.setResultType.bind( this )
    this.tabOpenEvent = this.tabOpenEvent.bind( this )
  
    this.cachePrior = this.cachePrior.bind( this )
    this.cacheNext = this.cacheNext.bind( this )
    this.cacheUpdate = this.cacheUpdate.bind( this )
    this.cacheLoad = this.cacheLoad.bind( this )
    
  }

  // shouldComponentUpdate(nextProps, nextState){}
  componentDidUpdate(prevProps, prevState, snapshot){
    if(this.state.mode === 'Exec') 
      this.pngRef.current.classList.add('pngIconSpin' )
    else
      this.pngRef.current.classList.remove('pngIconSpin' )

    if(this.autoFocus === '') return
    this.autoFocusRef.current.focus()
    this.autoFocus = ''
  }

  //
  fetch( event ){
    event.preventDefault()
    
    this.controller = new AbortController()
    let str = this.state.url
    if( this.state.headers.length > 0
    &&( !(this.state.headers.length === 1 && this.state.headers[0].trim() === '')))
      str += '\nHeaders:\n' +this.state.headers.join( '\n' )

    this.logWrite( 'Exec lib.fetch() with:', str, true )
    this.setState({ 
      resultData:'',
      resultType:'Text',
      mode:'Exec' 
    })

    this.apiTimer = performance.now()
    q.fetch(
      this.state.url, 
      this.controller.signal,
      this.fetchCallback, 
      this.state.headers,
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
          +`\n  1. server's request filtering--try url in browser address bar`
          +`\n  2. an error in a URL parameter--run in browser to get error messages`
        )
      }
  
      this.logWrite( 'Duration: ' +this.apiTimer +'ms' )
      this.logWrite( 'Debug: ' +debug )
      this.setState({ 
        resultData:'Error',
        resultType:'Text',
        mode:'Log' 
      })
    }
    else
      throw new Error( `APIForm.fetchCallback() error, unknown type received: [${type}].` )
  }
  fetchCancel( event ){
    event.preventDefault()
    if( this.state !== 'Exec' || this.controller === null ) return

    this.apiTimer = performance.now() -this.apiTimer
    this.controller.abort()
    this.controller = null

    this.logWrite( 'Execution cancelled by user.' )
    this.logWrite( 'Duration: ' +this.apiTimer +'ms' )
    this.setState({ 
      resultData:'Execution cancelled by user.',
      resultType:'Text',
      mode:'Log' 
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
      mode:'Result' 
    })
  }

  cacheToState( cacheitm ){
    urlKeyId++  // inc on url param change
    hdKeyId++   // inc on new header
    colKeyId++  // inc on column change
    qryKeyId++  // inc on new query line

    this.uobj = q.url.parse(  cacheitm.url  )
    this.uobj.headers = cacheitm.headers.slice()
    // this.uobj.disabled = JSON.parse(JSON.stringify( cacheitm.disabled ))
    this.uobj.qList = q.query.parse( this.uobj.query )
    if( this.uobj.headers.length === 0) this.uobj.headers.push('')
    if( this.uobj.qList.length === 0) this.uobj.qList.push('')

    this.setState({ 
      mode: 'Settings',   //one of: Settings, Log, Result, Exec
      cacheitm: cacheitm,
      ...this.uobj,
      headers: [ ...this.uobj.headers ],
      qList: [ ...this.uobj.qList ],
      log:'',
      resultData:'',
      resultType:'Text'   //one of: Text, JSON, XML
    })
  }
  cachePrior(event){ 
    let itm = cache.prior( this.state.cacheitm )
    if( itm === null ) itm = cache.last()

    this.cacheToState( itm )
  }
  cacheNext(event){ 
    let itm = cache.next( this.state.cacheitm )
    if( itm === null ) itm = cache.first()

    this.cacheToState( itm )
  }
  cacheUpdate(event){
    let itm = cache.update( 
      this.state.cacheitm,
      this.state.url,
      this.state.headers
    )
    this.setState({ cacheitm:itm })
  }
  cacheLoad(event){
    let itm = JSON.parse(JSON.stringify( this.state.cacheitm ))
    this.cacheToState( itm )
  }

  ctrlChange( colname, val, active, multi ){
    if(colname === undefined){
      throw new Error( 'APIForm.ctrlChange() error, colname === undefined.' )
    }
    
    if(colname === 'url'){    // reset this.uobj (local cache)
      this.uobj = q.url.parse( val )
      this.qList = q.query.parse( this.uobj.query )
      if( this.qList.length === 0) this.qList.push('')

      qryKeyId++
      colKeyId++
      this.setState({
        ...this.uobj,
        qList:this.qList
      })
    } else
    if(colname === 'header'){
      let list = [ ...this.state.headers ]
      list[ multi -1 ] = ( active === 'active' ?val :'' )
      this.setState({ headers:list })
    } else
    if(colname === 'query'){
      let list = [ ...this.state.qList ]
      list[ multi -1 ] = ( active === 'active' ?val :'' )
      let url = q.url.join( this.state, list )

      urlKeyId++
      this.setState({ 
        qList:list,
        url:url 
      })
    } else
    if( this.uobj[colname] !== undefined ){
      // make new url
      let state = { ...this.state }
      state[colname] = ( active === 'active' ?val :'' )
      state['url'] = q.url.join( state, this.state.qList )

      
      //update state
      // this.autoFocus = 'Edit'+colname
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
      if(idx >= this.uobj.headers.length)
        return ''
      return this.uobj.headers[ idx ]
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
    // renderNum++
    this.setState({ mode:mode })
  }
  multiHandler( event ){    //splice empty line into specified dataset
    let ctrl = event.target,
      colname = ctrl.dataset.colname,
      multi = Number( ctrl.dataset.multi )
      
    // console.log( 'multi', colname, multi )
    
    if( colname === 'header' ){
      this.uobj.headers = q.insertInList( this.uobj.headers, multi, '' )  //mirror in cache
      let list = q.insertInList( this.state.headers, multi, '' )
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
  tabOpenEvent( event ){
    window.open( this.state.url, '_blank' )
  }

  // create jsx
  getHeader(){
    let state = this.state
    let cacheitm = state.cacheitm

    return (
      <>
        <div className='frmPanel frmHeader'>
          <EditBox key={ urlKeyId +'url' } 
            canDisable={false} 
            colname='url' 
            heading='URL' 
            rows={5} 
            value={state.url} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
          >
            <span className='cachePnl' title={`Viewing: ${cacheitm.name}`}>
              <span onClick={this.cachePrior} className="material-icons btnIcon" title='Load prior Cache item'>arrow_left</span> 
              <span onClick={this.cacheLoad} className='cacheLabel' title='Reload from Cache'>Cache #{cacheitm.id}</span>
              <span onClick={this.cacheNext} className="material-icons btnIcon" title='Load next Cache item'>arrow_right</span> 
              <span className="material-icons btnIcon btnIconDisabled" title='Create new Cache item'>add_to_queue</span> 
              <span onClick={this.cacheUpdate} className="material-icons btnIcon" title='Update Cache item'>browser_updated</span> 
              <span className="material-icons btnIcon btnIconDisabled" title='Delete Cache item'>remove_from_queue</span> 
            </span>
            <button disabled={ this.state.mode === 'Exec' }onClick={this.fetch} >Exec</button>
            <button disabled={ this.state.mode !== 'Exec' } onClick={this.fetchCancel} >Cancel</button> 
            &nbsp; &nbsp;
            <span onClick={this.tabOpenEvent} className="material-icons btnIcon" title='Open in browser'>open_in_browser</span> 
          </EditBox>
          <img src={png} ref={ this.pngRef } className='pngIcon' alt='' ></img>
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
    if(this.state.mode === 'Log'
    || this.state.mode === 'Exec' )
      return this.renderLog()
    if(this.state.mode === 'Result')
      return this.renderResult()
  }
  renderSettings(){
    let state = this.state
    // console.log('keyid', urlKeyId, hdKeyId, qryKeyId, this.state )

    let hControls = []
    this.state.headers.forEach( ( str, idx ) => {
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
        <div className='frmPanel  frmData'>
          { this.getModeBar('Settings') }
          { hControls }
          <EditBox key={ colKeyId +'protocol' } 
            colname='protocol' 
            value={state.protocol} 
            heading='Protocol' 
            title='http or https'
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
          />
          <EditBox key={ colKeyId +'host' } 
            // canDisable={false}
            colname='host' 
            heading='Host' 
            value={this.state.host} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
           />
           <EditBox key={ colKeyId +'port' } 
            colname='port' 
            heading='Port' 
            value={this.state.port} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
           />
          <EditBox key={ colKeyId +'path' } 
            colname='path' 
            heading='Path' 
            value={this.state.path} 
            onChange={this.ctrlChange}
            getCacheVal={ this.getCacheVal }
          />
          { qListControls }
          <EditBox key={ colKeyId +'fragment' } 
            colname='fragment' 
            heading='Fragment' 
            value={this.state.fragment} 
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
        <div className='frmPanel frmData'>
          { this.getModeBar( 'Log' ) }
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
    return (
      <form className='apiForm' >
        { this.getHeader() }
        <div className='frmPanel frmData' >
          { this.getModeBar( 'Result' ) }
          <div className='resultBar' >
            <button onClick={this.setResultType} data-type='Text' 
              className={ resultType === 'Text' ?'selected' :''} >Text</button>
            <button onClick={this.setResultType} data-type='JSON' 
              disabled = { typeof resultData !== 'object' &&  resultData[0] !== '{' && resultData[0] !== '[' }
              className={ resultType === 'JSON' ?'selected' :''}  >JSON</button>
            <button onClick={this.setResultType} data-type='XML'  
              disabled = { typeof resultData === 'object' || resultData.trim()[0] !== '<' }
              className={ resultType === 'XML' ?'selected' :''} >XML</button>
          </div>
          { resultType === 'Text'  && <textarea key='resulttext' ref={ this.resultRef }
          // {  <textarea key='resulttext' ref={ this.resultRef }
            className='resultText'
            readOnly
            defaultValue={ typeof resultData === 'object'
            ? JSON.stringify( resultData, null, 3 )
            : resultData 
            }
            wrap='on'
          />}
          { resultType === 'JSON'  && 
            <div className='resultJSON' >
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