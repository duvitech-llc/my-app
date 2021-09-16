import './App.css';
import { OpenCvProvider } from 'opencv-react'
import CanvasWrapper from './components/CanvasWrapper';
import PhotoSelector from './components/PhotoSelector';


function App() {

  const onLoad = (cv) => {
    console.log('cv load')
  }
  return (
    <div className="App">
      <header className="App-header">
        <OpenCvProvider onLoad={onLoad}> 
          <PhotoSelector />
          <CanvasWrapper />
        </OpenCvProvider>
       
      </header>
    </div>
  );
}

export default App;
