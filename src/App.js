import './App.css';
import { Row, Col } from 'antd';
import { OpenCvProvider } from 'opencv-react'
import CanvasWrapper from './components/CanvasWrapper';
import PhotoSelector from './components/PhotoSelector';


function App() {

  const onLoad = (cv) => {
    console.log('cv load')
  }
  return (
    <div className="App">
      <OpenCvProvider onLoad={onLoad}> 
        <Row justify="center">
          <Col xxl={24} xs={24}>
            <PhotoSelector />
          </Col>
        </Row>
        <Row justify="center">
          <Col xxl={24} xs={24}>
            <CanvasWrapper />
          </Col>
        </Row>
      </OpenCvProvider>
    </div>
  );
}

export default App;
