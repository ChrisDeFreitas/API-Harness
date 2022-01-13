
const axios = require('axios').default

axios.get('https://www.songsterr.com/a/ra/songs.xml?pattern=Marley', {
  timeout: 1000,
  responseType: 'text',
  onDownloadProgress: function (progressEvent) {
    console.log('progress:', progressEvent )
  }
})
.then(function (response) {
  // handle success
  // console.log(response);
  console.log('config:', response.config);  
  console.log('headers:', response.headers);
  console.log('status:', response.status,response.statusText);
  console.log('data:', response.data.substring(0, 100))
})
.catch(function (error) {
  // handle error
  console.log(error);
})
// .then(function () {
//   // always executed
// });
