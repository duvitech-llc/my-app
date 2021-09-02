import './App.css';
import MyOpencvComponent from './components/MyOpencvComponent'
import { OpenCvProvider } from 'opencv-react'


function App() {

  const onLoad = (cv) => {
    console.log('cv load')
  }
  return (
    <div className="App">
      <header className="App-header">
        <OpenCvProvider onLoad={onLoad}> <MyOpencvComponent /></OpenCvProvider>
       
      </header>
    </div>
  );
}

export default App;
