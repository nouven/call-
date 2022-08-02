import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from 'simple-peer'

let socket;
function App() {
  let myVideo = useRef()
  let otherVideo = useRef()
  let me = useRef();
  let [stream, setStream] = useState();
  let [onlUsers, setOnlUsers] = useState([])
  let [calling, setCalling] = useState(false)
  let [call, setCall] = useState({})
  let [inputVal, setInputVal] = useState('');


  useEffect(() => {
    socket = io('https://videocallnouven.herokuapp.com')

    navigator.mediaDevices.getUserMedia({ video: true, audio: true})
      .then(stream => {
        setStream(stream)
        myVideo.current.srcObject = stream
      })

    socket.on('me', id => {
      me.current = id
    })
    socket.on('onl', onlUsers => {
      setOnlUsers(() => {
        return onlUsers.filter(onlUser => {
          return onlUser !== me.current
        })
      })
    })
    socket.on('callUser', ({ from, to, signal }) => {
      setCall({
        from,
        to,
        signal
      })
      setCalling(true)
    })

  }, [])
  let answerCall = () => {
    let peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })
    peer.on('signal', data => {
      socket.emit('answer', { signal: data, to: call.from })
    })
    peer.on('stream', currentStream => {
      otherVideo.current.srcObject = currentStream
    })
    peer.signal(call.signal)
    setCalling(false)
  }
  let callUser = (id) => {
    let peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.on('signal', (data) => {
      socket.emit('callUser', { signal: data, from: me.current, to: id })

    })
    peer.on('stream', currentStream => {
      otherVideo.current.srcObject = currentStream
    })

    socket.on('answer', ({ signal }) => {
      peer.signal(signal)
    })
  }
  return (
    <div className="relative / flex items-center justify-center h-screen ">
      <div className="relative / flex flex-col gap-1 ">
        <div className="relative / h-[250px] w-[350px] border border-black overflow-hidden">
          <video className="absolute right-0 bottom-0 /  w-[100px]" ref={myVideo} autoPlay />
          <video className="w-full h-full" ref={otherVideo} autoPlay />
        </div>
        <div className="relative / flex gap-2">
          <input value={inputVal} onChange={(e) => setInputVal(e.target.value)} className="relative / block outline-none border border-black p-1" placeholder="Enter user id" />
          <button onClick={() => callUser(inputVal)} className="relative / block / border border-black px-2 rounded-sm ">Call</button>
        </div>
        {calling && (
          <div className="relative / flex flex-end gap-2">
            <button onClick={() => answerCall()} className="relative / block / border border-black px-2 rounded-sm ">Accept</button>
            <button className="relative / block / border border-black px-2 rounded-sm ">Cancel</button>
          </div>
        )}
      </div>
      <div >
        <ul>
          {onlUsers.map(onlUser => {
            return (<li key={onlUser}>{onlUser}</li>)
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
