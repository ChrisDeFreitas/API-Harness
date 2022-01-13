/*
APIForm.jsx
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com

*/

import React from 'react'
import ReactJson from 'react-json-view'
import XMLViewer from 'react-xml-viewer'

import './APIForm.sass'
import EditBox from'./EditBox'
import q from'./lib.js'
import png from './resources/satelite-outline.png'

// manually incrementing keyid forces react to repaint
let urlKeyId = 0  // inc on url param change
let hdKeyId = 0   // inc on new header
let colKeyId = 0  // inc on column change
let qryKeyId = 0  // inc on new query line
              
class APIForm extends React.Component{

  constructor (props) {
    // console.log('APIForm.constructor()', props)
    super(props)

    // this.cache = q.url.parse('https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=522fdc88c5fec5c9f9598045831f4a42&tags=beach&format=json&nojsoncallback=1')
    // this.cache = q.url.parse('https://api.publicapis.org/entries')
    this.cache = q.url.parse('https://api.publicapis.org/entries?description=health')
    // this.cache = q.url.parse('https://www.songsterr.com/a/ra/songs.json?pattern=Marley')
    // this.cache = q.url.parse('https://www.songsterr.com/a/ra/songs.xml?pattern=Marley')
    // this.cache = q.url.parse('https://api.opentopodata.org/v1/test-dataset?locations=56,123')
    this.cache.header = ['']
    this.cache.qList = q.query.parse( this.cache.query )
    if( this.cache.header.length === 0) this.cache.header.push('')
    if( this.cache.qList.length === 0) this.cache.qList.push('')

    this.state  = {
      mode: 'Settings',   //one of: Settings, Log, Result, Exec
      ...this.cache,
      header: [ ...this.cache.header ],
      qList: [ ...this.cache.qList ],
      log:'',
      resultData:'',
      resultType:'text'   //one of: text, json, xml
    }
    
    this.autoFocus = ''
    this.autoFocusRef = React.createRef()
    this.pngRef = React.createRef()
    this.logRef = React.createRef()
    this.resultRef = React.createRef()
    
    this.apiTimer = 0   //time requests
    this.controller = new AbortController()
    this.logNum = 0
    
    this.apiExec = this.apiExec.bind( this )
    this.apiExecCallback = this.apiExecCallback.bind( this )
    this.apiExecCancel = this.apiExecCancel.bind( this )

    this.ctrlChange = this.ctrlChange.bind( this )
    this.getCacheVal = this.getCacheVal.bind( this )
    this.modeChange = this.modeChange.bind( this )
    this.multiHandler = this.multiHandler.bind( this )

    this.setResultType = this.setResultType.bind( this )
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
  apiExec( event ){
    event.preventDefault()
    
    this.controller = new AbortController()
    this.apiLogWrite( 'Exec lib.ajax() with:', this.state.url, true )
    this.setState({ 
      resultData:'',
      resultType:'text',
      mode:'Exec' 
    })

    this.apiTimer = performance.now()
    q.ajax(
      this.state.url, 
      null, //this.controller, //axios fails with: TypeError: config.signal.addEventListener is not a function
      this.apiExecCallback, 
      true 
    )
  }
  apiExecCallback( type, obj, debug, progressNum ){
    if( type === 'progress' ){    // obj = progressEvent
      let ss = obj.loaded +' bytes received'
      if( obj.lengthComputable === true )
        ss += ' of ' +obj.total +' - ' +(obj.loaded /obj.total *100) + '%'
      this.apiLogWrite( 'Progress #'+progressNum +':' +ss +', ' +obj.timeStamp +'ms')
    } else
    if( type === 'response' ){    // obj = response object
      this.apiTimer = performance.now() -this.apiTimer
      this.controller = null

      let str = obj.response
      if( typeof str  === 'object' )
        str = JSON.stringify( str, null, 3)

      this.apiLogWrite( 'Status: ' +obj.status +' ' +obj.statusText )
      this.apiLogWrite( 'Data size: ' + q.bytesToStr(( new TextEncoder().encode( str )).length ))
      this.apiLogWrite( 'Debug: ' +debug )
      this.apiLogWrite( 'Duration: ' +this.apiTimer +'ms' )
      this.apiLogWrite( 'Response:', str)
      this.apiResultWrite( obj.response )
    } else
    if( type === 'error' ){   // obj = error 
      this.apiTimer = performance.now() -this.apiTimer
      this.controller = null

      if( debug === false)
        console.log('Axios error thrown:', obj)
      if( obj.status )
        this.apiLogWrite('Ajax error:', 'Status ' +obj.status +', ' +obj.statusText )
      else
        this.apiLogWrite('Ajax error:', obj )
    }
    else
      throw new Error( `APIForm.apiExecCallback() error, unknown type received: [${type}].` )
  }
  apiExecCancel( event ){
    event.preventDefault()
    if( this.state !== 'Exec' && this.controller === null ) return

    this.apiTimer = performance.now() -this.apiTimer
    this.controller.abort()

    this.controller = null
    this.apiLogWrite( 'Execution cancelled by user.' )
    this.apiLogWrite( 'Duration: ' +this.apiTimer +'ms' )
    this.setState({ mode:'Log' })
  }
  apiLogWrite( head, str = '', reset = false ){
    
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
  apiResultWrite( result ){
    let type = 'text'
    if( typeof result === 'object' || result[0] === '{' || result[0] === '[')
      type = 'json'
    else
    if( result.trim()[0] === '<' )
      type = 'xml'

    this.setState({ 
      resultData:result,
      resultType:type,
      mode:'Result' 
    })
  }

  //
  ctrlChange( colname, val, active, multi ){
    if(colname === undefined){
      throw new Error( 'APIForm.ctrlChange() error, colname === undefined.' )
    }
    
    if(colname === 'url'){
      let uobj = q.url.parse( val )
      let qList = q.query.parse( uobj.query )
      if( qList.length === 0) qList.push('')

      qryKeyId++
      colKeyId++
      this.setState({
        ...uobj,
        qList:qList
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
  setResultType( event ){
    event.preventDefault()
    if( !event.target.dataset.type ) return
    this.setState({ resultType:event.target.dataset.type })
  }

  // create jsx
  getHeader(){
    let state = this.state
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
          />
          <img src={png} ref={ this.pngRef } className='pngIcon' alt='' ></img>
          <div className='frmButtonbar'>
            <button onClick={this.apiExec} >Exec</button>
            <button disabled={ true /*this.state.active !== 'Exec'*/ } onClick={this.apiExecCancel} >Cancel</button> 
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
            <button onClick={this.setResultType} data-type='text' 
              className={ resultType === 'text' ?'selected' :''} >Text</button>
            <button onClick={this.setResultType} data-type='json' 
              disabled = { typeof resultData !== 'object' &&  resultData[0] !== '{' && resultData[0] !== '[' }
              className={ resultType === 'json' ?'selected' :''}  >JSON</button>
            <button onClick={this.setResultType} data-type='xml'  
              disabled = { typeof resultData === 'object' || resultData.trim()[0] !== '<' }
              className={ resultType === 'xml' ?'selected' :''} >XML</button>
          </div>
          { resultType === 'text'  && <textarea key='resulttext' ref={ this.resultRef }
          // {  <textarea key='resulttext' ref={ this.resultRef }
            className='resultText'
            readOnly
            defaultValue={ typeof resultData === 'object'
            ? JSON.stringify( resultData, null, 3 )
            : resultData 
            }
            wrap='on'
          />}
          { resultType === 'json'  && 
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
          { resultType === 'xml'  && 
            <div className='resultXML' >
              <XMLViewer key='resultxml'
                xml={ resultData }
                indentSize={ 3 }
                collapsible={ true }
              />
            </div>
          }
          {/* { resultType === 'xml'  && <textarea key='resultxml' ref={ this.resultRef }
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