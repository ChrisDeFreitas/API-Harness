# API Harness

- This repo is a backup and personal knowledge base. Use at your own discretion.
- review ToDo list to see whats waiting to be fixed/implemented
- built for [**FireFox**](https://www.mozilla.org/firefox/new/)
- tested with FireFox on Windows, Linux and iPadOS ( essentially Safari with Firefox skin )

## Goals 
- create a general purpose tool to test API calls
- simplify editing Headers and URL parameters
- simplify viewing of data returned from endpoints
- run on localhost for security
- cache API calls short term in app memory (not Browser for security)
- cache API calls and results long term in SQLite database

## Tech Notes
- JSON and XML can be manually pasted into Result Text
- To Paste JSON/XML directly from Clipboard:  
-- when page accessed via http, requires ([reference](https://stackoverflow.com/questions/67440036/navigator-clipboard-readtext-is-not-working-in-js)):  
```
    1. Enter about:config in navigation bar
    2. Click "Accept the Risk and Continue"
    3. Search dom.events.testing.asyncClipboard and set true
```


## Thanks To
- Animations with [Framer Motion](https://www.framer.com/docs/) and CSS
- Background image, NBE_032-2.JPG, from unknown source (found in personal image archive)
- Built with the [React UI library](https://reactjs.org/)
- Code hosted on [Github](https://github.com/ChrisDeFreitas/guitarjoe)
- Convert XML to JSON with [xml-js](https://www.npmjs.com/package/xml-js)
- Icon library by [Google Fonts](https://fonts.google.com/icons)
- [JSON5 – JSON for Humans](https://github.com/json5/json5)
- [react-json-view](https://www.npmjs.com/package/react-json-view) Component
- [react-xml-viewe](https://www.npmjs.com/package/react-xml-viewer) Component
- [PNG API icon](https://www.flaticon.com/free-icon/api_3234207) from [flaticon.com](flaticon.com)  
- [PNG satelite dish](https://www.flaticon.com/premium-icon/satelite_4186682?related_id=4186682) from [flaticon.com](flaticon.com)  
- [Sass](https://sass-lang.com/) CSS extension language
- Technical references from [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web)

## ToDo
- build server caching backend; api calls launched and stored on server
- implement new logic for EditBox disable functionality. Disabled params need to exist in local and global caches. Currently, disabled status only stored in EditBox, so lost on React redraw--restored via Reload icon via APIForm.uobj.
- allow request type to be manually set; currently only GET used


## Updates

#### 20220216  
- added window.removeEventListener( GridResize )
- centered Result Grid using CSS
- refactored Result tab code 
- tweaks and updates

#### 20220213  
- added Grid to Result tab: convert JSON and XML data for a grid output 
- updated JSON Result tab: displays XML data converted to JSON
- added Result Text feature: copy/paste JSON/XML data from clipboard 
- added Result Text feature:  manually paste JSON/XML data into Result Textarea
- new JSON5: now used to parse all JSON ( see: https://262.ecma-international.org/5.1/ )
- renamed cacheData.json to cacheData.json5
- cache update: loading cacheData.json5 from document.URL (React public folder)
- cache update: store API Result and Log in cached record
- tweaks and updates

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