import logo from './logo.svg';
import './App.css';

import APIForm from './APIForm.jsx';
import cache from'./cache.js'

cache.add( 'https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=ad1348292ef2bee86ef39efea6b75d43&tags=Crete&format=json&nojsoncallback=1' )
cache.add( 'https://api.publicapis.org/entries' )
let cacheitm = cache.add( 'https://api.publicapis.org/entries?description=health' )
cache.add( 'https://www.songsterr.com/a/ra/songs.json?pattern=Marley' )
cache.add( 'https://www.songsterr.com/a/ra/songs.xml?pattern=Marley' )
cache.add( 'https://api.open-elevation.com/api/v1/lookup?locations=10,10|20,20|41.161758,-8.583933' )
cache.add( 'https://api.opentopodata.org/v1/test-dataset?locations=56,123' )
cache.add( 'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=DEMO_KEY' )
cache.add( 'https://jsonplaceholder.typicode.com/posts/1' )
cache.show()

function App() {
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
    </div>
  );
}

export default App;
