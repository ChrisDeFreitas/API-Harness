/*
EditBox.jsx
  - by Chris DeFreitas
  - display a formatted edit control in ApiHarness
  - edit types supported:
    -- input.type = text
    -- textarea
    -- multipe input.type = text => use multi=[line id], multiHandler=[function to update parent state with new row]
    -- -- click plus icon to insert new row


returns:
  <span className="editBox editBox_{props.colname}">
    <span>{props.heading}</span>
    <input type="text" value={props.value} dataset-colname={props.colname} ... >
    {edit icons}
  </span>  
*/

import React from 'react'
import PropTypes from 'prop-types';
import './APIForm.sass'

const EditBox = React.forwardRef((props, ref) => {
  // console.log('EditBox.constructor()', props)
  
  const [val, setVal] = React.useState( props.value )
  const [active, setActive] = React.useState( 'active' )  //active/disabled/deleted
  const colname = props.colname
  const multi = ( props.multi === null ?'' :props.multi )

  // input/textarea event handlers
  function changeEvent( event ){
    setVal( event.target.value )
    if( props.onChange != null ){
      props.onChange( colname, event.target.value, active, multi )
    } 
  }
  function clickEvent( event ){
    if (event.detail === 3) {
      let ctrl = event.target
      ctrl.select()
      event.preventDefault()
    }
  }
  function keyDown( event ){
    if( event.altKey !== true ) return

    // if(event.key === 'e'){   // todo: exec handler in props for shortcut key to work
    //   execEvent( event )
    //   event.preventDefault()
    // } else
    if(event.key === 't' && props.canDisable === true){
      toggleEvent( event )
      event.preventDefault()
    } else
    if(event.key === 'r'){
      resetEvent( event )
      event.preventDefault()
    } else
    if(event.key === 'c'){
      clearEvent( event )
      event.preventDefault()
    } else
    if(event.key === 'n' && props.multiHandler){
      props.multiHandler( event )
      event.preventDefault()
    } 
  }

  // button handlers  
  function toggleEvent( event ){
    let tmp = ( active === 'active' ?'inactive' :'active' )
    setActive( tmp )
    if( props.onChange != null )
      props.onChange( colname, val, tmp, multi )
  }  
  function resetEvent( event ){
    let val = props.getStoredVal( colname, multi )
    setVal( val )
    if( props.onChange != null )
      props.onChange( colname, val, active, multi )
  }
  function clearEvent( event ){
    setVal( '' )
    if( props.onChange != null )
      props.onChange( colname, '', active, multi )
  }

  let activeIcon = ( active === 'active' ?'check_circle_outline' :'radio_button_unchecked' )
  let btnDisable = ( props.canDisable === false ? ''
    : <span className="material-icons btnIcon" title='Toggle Enable/Disable (Alt+T)' onClick={toggleEvent} >{activeIcon}</span> )
  let btnMulti = ( multi === '' 
    ?null
    : <span className="material-icons btnIcon" title={'Add new ' +colname +' line (Alt+N)'}
        data-colname={colname}
        data-multi={multi}
        onClick={props.multiHandler} 
      >add_circle_outline</span> 
  )
    
  let ctrl = null
  let readOnly = props.readOnly
  if(props.rows !== null){  // create textarea control
    ctrl = <textarea  ref={ref}
      data-colname={colname}
      data-multi={multi}
      disabled = {(active !== 'active' ?true :false)}
      id = {'Edit' +colname +multi}
      // maxlength={props.width}
      readOnly={readOnly} 
      rows={props.rows} 
      title={props.title} 
      value={val} 
      onChange={changeEvent}
      onClick={clickEvent}
      onKeyDown={keyDown}
    />
  }
  else{                     //create input
    ctrl = <input type='text' ref={ref}
      data-colname={colname}
      data-multi={multi}
      disabled = {(active !== 'active' ?true :false)}
      id = {'Edit' +colname +multi}
      readOnly={props.readOnly} 
      title={props.title} 
      value={val} 
      // maxlength={props.width} 
      onChange={changeEvent}
      onClick={clickEvent}
      onKeyDown={keyDown}
    />
  }

  return (
    <span className={'editBox editBox_'+colname} >
      <span className='heading' >{props.heading}</span> 
      { ctrl }
      { !readOnly 
      &&  <span className='btnIconPnl'>
        { props.children }
        { btnDisable }
        <span onClick={clearEvent} className="material-icons btnIcon" title='Clear contents  (Alt+C)'>delete</span> 
        <span onClick={resetEvent} className="material-icons btnIcon" title='Reload initial value  (Alt+R)'>replay</span> 
        { btnMulti }
      </span> }
    </span>
  )

})

EditBox.propTypes = {
  canDisable: PropTypes.bool,
  colname: PropTypes.string,
  heading: PropTypes.string,
  readOnly: PropTypes.bool,
  rows: PropTypes.number,   // rows !== null then use textarea
  title: PropTypes.string,
  value: PropTypes.string,

  multi: PropTypes.number,      // id of multi input items
  multiHandler: PropTypes.func, // parent function to add dynamic input
  
  onChange: PropTypes.func,
  getStoredVal: PropTypes.func,
}
EditBox.defaultProps = {
  canDisable: true,
  colname: '',
  heading: 'EditBox',
  readOnly: false,
  rows: null,
  title: '',
  value: '',
  
  multi: null,
  multiHandler: null,

  onChange: null,
  getStoredVal: null
}

export default EditBox