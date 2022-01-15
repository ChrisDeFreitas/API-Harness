# API Harness

Note: 
- This repo is a backup and personal knowledge base. Use at your own discretion.
- not meant for public consumption, still testing -- expect bugs
- review ToDo list to see whats waiting to be fixed/implemented
- built for FireFox

Currently: 
- GET requests working via Fetch
- testing usability and for side effects before more development
- XML and JSON components may go away if they don't demonstrate higher value than text output (because of poor performance with large datasets)  

## Goals 
- create a general purpose tool to test API calls
- simplify editing Headers and URL parameters
- run on localhost for security
- cache API calls short term in app memory (not Browser for security)
- cache API calls and results long term in SQLite database

## Thanks To

- Background image, NBE_032-2.JPG, from unknown source (found in personal image archive)
- Built with the [React UI library](https://reactjs.org/)
- Code hosted on [Github](https://github.com/ChrisDeFreitas/guitarjoe)
- [Flickr API](https://www.flickr.com/services/api/)
- Icon library by [Google Fonts](https://fonts.google.com/icons)
- [react-json-view](https://www.npmjs.com/package/react-json-view) Component
- [react-xml-viewe](https://www.npmjs.com/package/react-xml-viewer) Component
- [PNG API icon](https://www.flaticon.com/free-icon/api_3234207) from [flaticon.com](flaticon.com)  
- [PNG satelite dish](https://www.flaticon.com/premium-icon/satelite_4186682?related_id=4186682) from [flaticon.com](flaticon.com)  
- Technical references from [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web)

## ToDo
- resolve CORS error with: https://api.opentopodata.org/v1/test-dataset?locations=56,123
- allow panels to remain in memory (instead of redrawing)
- test for stability, performance, and possible functionality enhancements before digging into caching
- allow form width to be expanded by user dragging
- fix display on ipad/landscape; background repeats, should stretch
- allow request type to be manually set; currently only GET used
- create url caching logic; currently cache stores initial url only  
-- cache requests locally  
-- build form to access cache data  
- build server caching backend
- look into improving performance for large datasets  
-- JSON view = JSON.stringify( JSON.parse( jsonstring ), null, 3)  
-- xml view = function to iterate and insert indents per level ( level 3 = (3 x 3spaces) )  
-- custom viewer = iterate object and indents per level (potential to output HTML/JSX with functionality)  
--- xml/json view would be simple text view with indents

## Updates

#### 20220114
- implemented Fecth API instead of XMLHttpRequest because of greater control
- added Header functionality
- implemented AbortController and Cancel button
- query params now handled with [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) and [encodeURI](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI)
- uninstalled Axios
- implemented 'select all text' via triple-click in editboxes 
- fixes, updates and tweaks

#### 20220112
- implemented Axios then replaced it with XMLHttpRequest because of poor documentation 
- implemented react-json-view
- implemented react-xml-view
- completed api call handling
- bug fixes and ui updates

#### 20220111
- UI tweaks
- removed unused files

#### 20220110
- upload of working UI 
