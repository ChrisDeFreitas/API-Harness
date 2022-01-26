import logo from './logo.svg';
import './App.css';

import APIForm from './APIForm.jsx';
import cache from'./cache.js'

// create global query cache
cache.add( 
  'https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=ae7a8f0923f78862f2082cf39148b3bd&tags=cliffs&format=json&nojsoncallback=1',
  'flickr.photos.search',
  'Combine Owner and ID to derive webpage URL: https://www.flickr.com/photos/[OwnerID]/[PhotoID]',
)
cache.add(
   'https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=ae7a8f0923f78862f2082cf39148b3bd&photo_id=51843886361&format=json&nojsoncallback=1',
   'flickr.photos.getInfo',
   'Reurn JSON data about photo, inluding URL'
)
cache.add( 'https://api.publicapis.org/entries' )
let cacheitm = cache.add( 'https://api.publicapis.org/entries?description=health' )
cache.add( 'https://www.songsterr.com/a/ra/songs.json?pattern=Marley' )
cache.add( 'https://www.songsterr.com/a/ra/songs.xml?pattern=Marley' )
cache.add( 'https://api.open-elevation.com/api/v1/lookup?locations=10,10|20,20|41.161758,-8.583933' )
cache.add( 'https://api.opentopodata.org/v1/test-dataset?locations=56,123' )
cache.add( 'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=DEMO_KEY' )
cache.add( 'https://jsonplaceholder.typicode.com/posts/1' )
cache.add( 
  'https://stats.nba.com/stats/scoreboard/todaysScoreboard_00.json',
  'NBA todaysScoreboard',
  'API call fails',
  [
   'x-nba-stats-origin:stats',
   'x-nba-stats-token:true',
  ]
)
cache.add( 
  'https://sportsdatabase.com/NBA/query.json?sdql=date,team,o:team,line@date=20220125%20and%20team=Trailblazers',
  'SQL API',
  'API call needs refinement; Has CORS error.',
  [
   'token:YOUR_TOKEN',
   'user:USER_NAME',
  ]
)
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
