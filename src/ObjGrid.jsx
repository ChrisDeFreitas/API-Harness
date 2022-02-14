/*
  ObjGrid.jsx
  - display an object in a grid with handy functions
  - logic in objMapLib.jsx
  - by Chris DeFreitas
  - used by API Harness

*/
import React from 'react'
import PropTypes from 'prop-types';

import lib from './objMapLib.jsx'
import './ObjGrid.sass'

function ObjGrid( props ) {

  // console.log('props.obj', props.obj)

  let obj = ( props.obj ?props.obj :[{ Error:'ObjGrid.jsx error: props.obj is not supplied.' }] )

  let mapListTmp = lib.create( obj )

  const [mapList, setMapList] = React.useState( mapListTmp )
  mapListTmp = null

  function cbKeyClick( event ){
    let cb = event.target
    let id = Number( cb.dataset.id )

    let mapListTmp = {...mapList}
    let map = lib.findId( id, mapListTmp.items )
    if( typeof map !== 'object' ){
      throw new Error(`ObjGrid.cbKeyClick() error, id not found in mapList:[${id}].`)
    }
    map.selected = !map.selected
    setMapList( mapListTmp )
  }
   
  return (
    <div className='objGrid'  >
      <header>Grid Settings</header>
      <div className='gridSettingsPnl'>
        { lib.mapListToTableJSX( mapList, cbKeyClick )}
      </div>
      <div className='gridDataPnl'>
        {/* <header>Data</header> */}
        { lib.mapObjToTableJSX( mapList, obj )}
      </div>
    </div>
  )
}

ObjGrid.propTypes = {
  obj: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
}
ObjGrid.defaultProps = {
  obj: null
}

export default ObjGrid
