import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MediaHandler from '../MediaHandler'
import Peer from 'simple-peer'


export default class App extends Component {
    constructor() {
        super();

        this.state = {
            hasMedia: false,
            otherUserId: null
        };

        this.user = window.user
        console.log(this.user);
        
        this.user.stream = null
        this.peers = {}

        this.mediaHandler = new MediaHandler()
        this.setupPusher()

        this.callTo = this.callTo.bind(this)
        this.setupPusher = this.setupPusher.bind(this)
        this.startPeer = this.startPeer.bind(this)
    }

    componentWillMount() {
        
        this.mediaHandler.getPermissions()
            .then((stream) => {
                this.setState({ hasMedia: true })
                this.user.stream = stream

                try {
                    this.myVideo.srcObject = stream
                } catch (e) {
                    this.myVideo.src = URL.createObjectURL(stream)
                }

                this.myVideo.play();
            })
    }

    setupPusher() {

        window.Echo.private(`client-signal-${this.user.id}`)
            .listen('CallUser', (e) => {
            console.log(e)
                // let peer = this.peers[signal.userId];

                // // if peer is not already exists, we got an incoming call
                // if (peer === undefined) {
                //     this.setState({ otherUserId: signal.userId });
                //     peer = this.startPeer(signal.userId, false);
                // }

                // peer.signal(signal.data)
        })
    }

    async startPeer(userId, initiator = true) {
        const peer = new Peer({
            initiator,
            stream: this.user.stream,
            trickle: false
        });

        peer.on('signal', async  (data) => { 
            try {
                let response = await window.axios.post('call/' + userId, { data, type: 'signal' })
                console.log(response)
            } catch (error) {
                console.log(error)
            }
        })

        peer.on('stream', (stream) => {
            try {
                this.userVideo.srcObject = stream;
            } catch (e) {
                this.userVideo.src = URL.createObjectURL(stream);
            }

            this.userVideo.play();
        });

        peer.on('close', () => {
            let peer = this.peers[userId];
            if (peer !== undefined) {
                peer.destroy();
            }

            this.peers[userId] = undefined;
        });

        return peer;
    }

    callTo(userId) {
        this.peers[userId] = this.startPeer(userId);
    }

    render() {
        return (
            <div className="App">
                {[1, 2, 3, 4].map((userId) => {
                    return this.user.id !== userId ? <button key={userId} onClick={() => this.callTo(userId)}>Call {userId}</button> : null;
                })}

                <div className="video-container">
                    <video className="my-video" ref={(ref) => { this.myVideo = ref; }}></video>
                    <video className="user-video" ref={(ref) => { this.userVideo = ref; }}></video>
                </div>
            </div>
        );
    }
}

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'))
}