import React from 'react'
import { useEffect, useRef } from 'react';
import ADDImageIcon from '../../assets/add_image_icon.png'
import './index.css';


export const PhotoSelector = (props) => {
  const { imageUrl } = props
  const loadPhoto = (e, retries = 0) => {
    var fr = new FileReader();
    var filename = e.target.files[0];

    fr.onload = () => {
      console.log('File Load Completed');
      //this.$emit('update:imageUrl', fr.result);
    };

    fr.readAsDataURL(filename);
  }

  return (
    <div className='photos'>
      <label className='loadPhoto' htmlFor='load_photo'>
        <img className='image' src={ADDImageIcon} />
      </label>
      <input type='file' id='load_photo' accept='image/*' hidden='hidden' alt='' onChange={(e) => loadPhoto(e)} />
    </div>
  );
};


export default PhotoSelector;