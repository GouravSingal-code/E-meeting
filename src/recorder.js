import React, { useState, useRef } from "react";
import "./styles.css";

export default function App() {
  const [streamRecorder, setStreamRecorder] = useState({
    access: false,

    recorder: null,
    error: ""
  });

  const [recording, setRecording] = useState({
    active: false,
    available: false,
    url: ""
  });

  const chunks = useRef([]);

  function getAccess() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mic) => {
        let mediaRecorder;

        try {
          mediaRecorder = new MediaRecorder(mic, {
            mimeType: "audio/webm"
          });
        } catch (err) {
          console.log(err);
        }

        const track = mediaRecorder.stream.getTracks()[0];
        track.onended = () => console.log("ended");

        mediaRecorder.onstart = function () {
          setRecording({
            active: true,
            available: false,
            url: ""
          });
        };

        mediaRecorder.ondataavailable = function (e) {
          console.log("data available");
          chunks.current.push(e.data);
        };

        mediaRecorder.onstop = async function () {
          console.log("stopped");

          const url = URL.createObjectURL(chunks.current[0]);
          chunks.current = [];

          setRecording({
            active: false,
            available: true,
            url
          });
        };

        setStreamRecorder({
          ...streamRecorder,
          access: true,
          recorder: mediaRecorder
        });
      })
      .catch((error) => {
        console.log(error);
        setStreamRecorder({ ...streamRecorder, error });
      });
  }

  return (
    <div className="App">
      {streamRecorder.access ? (
        <div className="audio-container">
          <button
            className={recording.active ? "active" : null}
            onClick={() => !recording.active && streamRecorder.recorder.start()}
          >
            Start Recording
          </button>
          <button onClick={() => streamRecorder.recorder.stop()}>Stop Recording</button>
          {recording.available && <audio controls src={recording.url} />}
        </div>
      ) : (
        <button onClick={getAccess}>Get Mic Access</button>
      )}
    </div>
  );
}
