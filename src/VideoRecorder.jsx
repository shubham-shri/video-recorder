import React, { useState, useRef } from "react";
import { CiVideoOn } from "react-icons/ci";
import { IoMdVideocam } from "react-icons/io";
import { FaPauseCircle, FaPlay, FaRegStopCircle } from "react-icons/fa";

const VideoRecorder = () => {
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPreviewOn, setIsPreviewOn] = useState(false);
  const [count, setCount] = useState(0);
  const [stream, setStream] = useState(undefined);

  const startVideoPreview = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = newStream;
      setStream(newStream);
      setIsPreviewOn(true);
      setCount((prev) => prev + 1);
    } catch (err) {
      alert("Camera permission not granted!!");
      setIsPreviewOn(false);
      setCount(0);
    }
  };

  const startRecording = async () => {
    try {
      setIsPreviewOn(false);
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);

      const chunks = [];
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(recordedBlob);
        download(url);
      };

      recorder.start();
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPreviewOn(true);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      mediaRecorder.resume();
    } else {
      mediaRecorder.pause();
    }
    setIsPaused(!isPaused);
  };

  const download = (url) => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "recording.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderButtons = () => {
    if (!isPreviewOn && count === 0) {
      return (
        <button
          title="Start Preview"
          className="btn"
          onClick={startVideoPreview}
        >
          <CiVideoOn size={30} />
        </button>
      );
    }
    if (!isRecording) {
      return (
        <button
          title="Start Recording"
          className="btn"
          onClick={startRecording}
        >
          <IoMdVideocam size={30} />
        </button>
      );
    }
    if (isRecording) {
      return (
        <>
          <button
            className="btn"
            onClick={togglePause}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <FaPlay size={30} /> : <FaPauseCircle size={30} />}
          </button>
          <button className="btn" onClick={stopRecording}>
            <FaRegStopCircle size={30} />
          </button>
        </>
      );
    }
  };

  return (
    <div className="app__container">
      {!isPreviewOn && count === 0 ? (
        <h1 className="title">Press the button to start the preview</h1>
      ) : null}
      <div className="video__container">
        <video className="video" ref={videoRef} autoPlay muted />
      </div>
      <div className="btn__container">{renderButtons()}</div>
    </div>
  );
};

export default VideoRecorder;
