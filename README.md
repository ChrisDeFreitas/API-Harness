# API Harness

- This repo is a backup and personal knowledge base. Use at your own discretion.
- review ToDo list to see whats waiting to be fixed/implemented
- built for FireFox

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
- Icon library by [Google Fonts](https://fonts.google.com/icons)
- [react-json-view](https://www.npmjs.com/package/react-json-view) Component
- [react-xml-viewe](https://www.npmjs.com/package/react-xml-viewer) Component
- [PNG API icon](https://www.flaticon.com/free-icon/api_3234207) from [flaticon.com](flaticon.com)  
- [PNG satelite dish](https://www.flaticon.com/premium-icon/satelite_4186682?related_id=4186682) from [flaticon.com](flaticon.com)  
- [Sass](https://sass-lang.com/) CSS extension language
- Technical references from [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web)

## ToDo
- Private_class_fields: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
- Destructuring_assignment: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
- Nullish_coalescing_operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
- Optional_chaining: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
- implement new logic for EditBox disable functionality. Disabled params need to exist in local and global caches. Currently, disabled status only stored in EditBox, so lost on React redraw--restored via Reload icon via APIForm.uobj.
- allow form width to be expanded by user dragging
- allow request type to be manually set; currently only GET used
- build server caching backend
- look into improving performance for large datasets  
-- JSON view = JSON.stringify( JSON.parse( jsonstring ), null, 3)  
-- xml view = function to iterate and insert indents per level ( level 3 = (3 x 3spaces) )  
-- custom viewer = iterate object and indents per level (potential to output HTML/JSX with functionality)  
--- xml/json view would be simple text view with indents

## Updates

#### 20220128
- added /cacheData.json to make it easy to edit
- moved cache data loading to App.js
- added CacheListbox component to Cache tab

#### 20220126
- refactored, refactored, refactored and then some

#### 20220116
- added cache.js for global url caching--not fully implemented. Functionality is basic but sufficient for now.
- resolved issue caching url params in APIForm.jsx
- refactored URL UI
- refactored display of icon buttons in EditBox
- refactored button and button icons for URL
- hid 'enable' button for URL
- added 'open in tab' button to URL
- added caching buttons to URL
- removed unused files

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
