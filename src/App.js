import React from 'react'

import logo from './logo.svg';
import './App.css';

import APIForm from './APIForm.jsx';
import cache from'./cache.js'

// import FormDragHTML5 from './tmp/FormDragHTML5.jsx';

function App() {
  
  // redraw components once cache is loaded from /cacheData.json
  const [cacheSize, setCacheSize] = React.useState( cache.items.length )
  React.useEffect(() => {   
    if( cacheSize <= 1){
      cache.init( () => {
        setCacheSize( cache.items.length )    
      })
    }
  })

  let cacheitm = cache.first()
  return (
    <div className="App">
      <div className='appHeader'>
        <img src={logo} className="App-logo" alt="logo" />
        <br />
        <label>API Harness</label>
      </div>
      <APIForm 
        cacheitm={cacheitm}
      />
      {/* <FormDragHTML5 /> */}
    </div>
  );
}

export default App;
