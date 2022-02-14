/*
CacheListbox.jsx
  - by Chris DeFreitas
  - display a list of cache item in ApiHarness
*/

import React from 'react'
import PropTypes from 'prop-types';

import cache from'./cache.js'
import './CacheListbox.sass'

const CacheListbox = React.forwardRef((props, ref) => {
  
  function clickEvent( event ){
    let id = Number( event.target.dataset.id )
    if( props.select !== null )
      props.select( id )
  }
  function dblClickEvent( event ){
    let id = Number( event.target.dataset.id )
    if( props.dblClick !== null )
      props.dblClick( id )
  }

  let list = []
  cache.items.forEach( (itm, idx) => {
    let selected = ( itm.id === props.selectedID ?'selected' :null )
    list.push(
      <span key={itm.id} className={selected}
        data-id={itm.id} 
        title={'URL: ' +itm.url} 
        onClick={clickEvent} 
        onDoubleClick={dblClickEvent} 
      >
        {itm.id +'. ' +itm.name}
      </span>
    )
  })

  return (
    <div className='cacheListbox'>
      {list}
    </div>
  )
})

CacheListbox.propTypes = {
  selectedID: PropTypes.number,
  select: PropTypes.func,
  dblClick: PropTypes.func
}
CacheListbox.defaultProps = {
  selectedID: 0,
  select: null,
  dblClick: null
}

export default CacheListbox