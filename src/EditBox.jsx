/*
EditBox.jsx
  - by Chris DeFreitas, ChrisDeFreitas777@gmail.com
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
  function keyDown( event ){
    if( event.altKey === true ){
      if(event.key === 'e' && props.canDisable === true){
        toggleEvent( event )
        event.preventDefault()
      } else
      if(event.key === 'r'){
        resetEvent( event )
        event.preventDefault()
      } else
      if(event.key === 'd'){
        clearEvent( event )
        event.preventDefault()
      } else
      if(event.key === 'n' && props.multiHandler){
        props.multiHandler( event )
        event.preventDefault()
      } 
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
    let val = props.getCacheVal( colname, multi )
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
  let btnDisable = ( props.canDisable === true
    ? <span className="material-icons btnIcon" title='Enable/Disable (Alt+E)' onClick={toggleEvent} >{activeIcon}</span>
    : <span className="material-icons btnIconEnabled" title='Always Enabled' >check_circle_outline</span>)
  let btnMulti = ( multi === '' 
    ?null
    : <span className="material-icons btnIcon" title={'Add new ' +colname +' line (Alt+N)'}
        data-colname={colname}
        data-multi={multi}
        onClick={props.multiHandler} 
      >add_circle_outline</span> 
  )
    
  let ctrl = null
  if(props.rows !== null){  // create textarea control
    ctrl = <textarea  ref={ref}
      data-colname={colname}
      data-multi={multi}
      disabled = {(active !== 'active' ?true :false)}
      id = {'Edit' +colname +multi}
      rows={props.rows} 
      title={props.title} 
      value={val} 
      // maxlength={props.width} 
      onChange={changeEvent}
      onKeyDown={keyDown}
    />
  }
  else{                     //create input
    ctrl = <input type='text' ref={ref}
      data-colname={colname}
      data-multi={multi}
      disabled = {(active !== 'active' ?true :false)}
      id = {'Edit' +colname +multi}
      title={props.title} 
      value={val} 
      // maxlength={props.width} 
      onChange={changeEvent}
      onKeyDown={keyDown}
    />
  }

  return (
    <span className={'editBox editBox_'+colname} >
      <span className='heading' >{props.heading}</span> 
      { ctrl }
      { btnDisable }
      <span onClick={clearEvent} className="material-icons btnIcon" title='Delete contents  (Alt+D)'>delete</span> 
      <span onClick={resetEvent} className="material-icons btnIcon" title='Reload initial value  (Alt+R)'>replay</span> 
      { btnMulti }
    </span>
  )

})

EditBox.propTypes = {
  canDisable: PropTypes.bool,
  colname: PropTypes.string,
  heading: PropTypes.string,
  rows: PropTypes.number,   // rows !== null then use textarea
  title: PropTypes.string,
  value: PropTypes.string,

  multi: PropTypes.number,      // id of multi input items
  multiHandler: PropTypes.func, // parent function to add dynamic input
  
  onChange: PropTypes.func,
  getCacheVal: PropTypes.func,
}
EditBox.defaultProps = {
  canDisable: true,
  colname: '',
  heading: 'EditBox',
  rows: null,
  title: '',
  value: '',
  
  multi: null,
  multiHandler: null,

  onChange: null,
  getCacheVal: null
}

export default EditBox