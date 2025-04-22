"use client"
import React from 'react';
import styles from '../styles/textAnimation.module.css';

function FlipAnimation() {
  return (
    <>
      <div className={styles.container}>
        Make 
        <div className={styles.flip}>
          <div>wOrK</div>
          <div>lifeStyle</div>
          <div>Everything</div>
        </div>
        AweSoMe!
      </div>
      
    </>
  );
}

export default FlipAnimation;