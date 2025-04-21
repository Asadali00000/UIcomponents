"use client"
import React, { useEffect, useRef } from 'react'
import styles from '../styles/rippleEffect.module.css'
function RippleEffect() {
	const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
	const box = boxRef.current;
	if (!box) return;

	let rippleElement:HTMLElement | null = null;
	let expandAnimation:Animation | null = null;

	const handleMouseEnter = (e:MouseEvent) => {
		// Create new ripple element
		rippleElement = document.createElement('span');
		rippleElement.className = styles.ripple;

		// Position the ripple where mouse entered
		const rect = box.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		rippleElement.style.left = `${x}px`;
		rippleElement.style.top = `${y}px`;

		// Add to DOM
		box.appendChild(rippleElement);

		// Force a reflow
		void rippleElement.offsetWidth;

		// Start expansion
		rippleElement.classList.add(styles.expand);

		// Store the animation reference
		expandAnimation = rippleElement.getAnimations()[0];
	};

	const handleMouseLeave = (e:MouseEvent) => {
		if (rippleElement) {
			// Stop the expand animation at current state
			if (expandAnimation) {
				expandAnimation.pause();
			}

			// Get current scaled size from computed style
			const computedStyle = window.getComputedStyle(rippleElement);
			const transform = computedStyle.getPropertyValue('transform');
			const currentScale = transform !== 'none' ? parseFloat(transform.split(',')[3]) : 1;

			// Remove the expand class to stop that animation
			rippleElement.classList.remove(styles.expand);

			// Create a position for shrink based on where mouse left
			const rect = box.getBoundingClientRect();
			const leaveX = e.clientX - rect.left;
			const leaveY = e.clientY - rect.top;

			// Create a new shrinking ripple at the leave position
			const shrinkRipple = document.createElement('span');
			shrinkRipple.className = styles.ripple;
			shrinkRipple.style.left = `${leaveX}px`;
			shrinkRipple.style.top = `${leaveY}px`;

			// Set the initial scale to match the current expand scale
			shrinkRipple.style.transform = `scale(${currentScale})`;
			shrinkRipple.style.opacity = '0.3';  // Match the expanded opacity

			// Add to DOM
			box.appendChild(shrinkRipple);

			// Force a reflow
		 void 	shrinkRipple.offsetWidth;

			// Start shrinking
			shrinkRipple.classList.add(styles.shrink);

			// Remove original ripple
			rippleElement.remove();
			rippleElement = shrinkRipple;

			// Remove after animation completes
			setTimeout(() => {
				if (shrinkRipple && shrinkRipple.parentElement) {
					shrinkRipple.remove();
				}
				// Match the animation duration
			}, 1000);
		}
	};

	box.addEventListener('mouseenter', handleMouseEnter);
	box.addEventListener('mouseleave', handleMouseLeave);

	return () => {
		if (box) {
			box.removeEventListener('mouseenter', handleMouseEnter);
			box.removeEventListener('mouseleave', handleMouseLeave);
		  }
	};
}, []);

	return (
		<div className={`${styles.container}` } ref={boxRef}>
		 <div className={styles.text}>
				Asad ali
			</div>

		</div>
	)
}

export default RippleEffect
