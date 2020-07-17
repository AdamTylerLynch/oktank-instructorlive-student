import React, { Component } from 'react';
import Hls from 'hls.js';
import styles from './styles';

class Video extends Component {
	constructor(props) {
		super(props);
		this.state = {
			src: 'https://d1mpc9fp5n1p3a.cloudfront.net/out/v1/26fcb1f201e744609188cdf416959023/index.m3u8'
		};
	}

	componentDidMount(){
		// Supports MediaSource API
		if(Hls.isSupported()) {
			var hls = new Hls();
			hls.loadSource(this.state.src);
			hls.attachMedia(this.player);
			hls.on(Hls.Events.MANIFEST_PARSED, (() => {
				this.player.play();
			}).bind(this));
		// Safari Mobile Detected
		} else if (this.player.canPlayType('application/vnd.apple.mpegurl')) {
			this.player.src = this.state.src;
			this.player.addEventListener('loadedmetadata', (() => {
				this.player.play();
			}).bind(this));
		}
	}

	render(){
		return(
			<div className="video-container" style={{
				...styles.videoStyle
			}}>
				<video ref={(player) => this.player = player} controls ></video>
			</div>
		);
	}
}

export default Video;