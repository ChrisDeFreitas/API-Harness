import logo from './logo.svg';
import './App.css';
import APIForm from './APIForm.jsx';

function App() {
  return (
    <div className="App">
      <div className='appHeader'>
        <img src={logo} className="App-logo" alt="logo" />
        <br />
        <label>API Harness</label>
      </div>
      <APIForm />
    </div>
  );
}

export default App;
