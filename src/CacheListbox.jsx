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
    console.log( 111, id )
    if( props.onSelect !== null )
      props.onSelect( id )
  }

  let list = []
  cache.items.forEach( (itm, idx) => {
    let selected = ( itm.id === props.selectedID ?'selected' :null )
    list.push(
      <span key={itm.id} onClick={clickEvent} className={selected}
        data-id={itm.id} 
        title={'URL: ' +itm.url} >
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
  onSelect: PropTypes.func,
}
CacheListbox.defaultProps = {
  selectedID: 0,
  onSelect: null
}

export default CacheListbox