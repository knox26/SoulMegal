import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Phone, PhoneOff } from "lucide-react";
import Chat from "@/components/Chat";
import { useChatStore } from "@/store/useChatStore";

function VideoCall() {
  const { authUser, match, setMatch, socket, role, setRole } = useAuthStore();
  const { setMessagesNull } = useChatStore();
  useEffect(() => {
    socket.on("match-found", ({ match, role }) => {
      console.log(`my role is ${role} and matched with`, match);
      setMatch(match);
      setRole(role);
    });

    socket.on("ended-call", ({ msg }) => {
      if (msg === "call ended") {
        setMatch(null);
        setMessagesNull();
        setRole(null);
        console.log("call ended by next person");
      }
    });
  }, [socket, setMatch]);

  const startCall = () => {
    socket.emit("find-match", { id: authUser._id });
  };

  const endCall = () => {
    socket.emit("end-call", { to: match, msg: "call ended" });
    console.log("call ended by me");
    setMatch(null);
    setMessagesNull();
    setRole(null);
  };

  return (
    <div className="pt-20 flex flex-col justify-center items-center h-screen">
      <div className=" flex justify-center md:gap-5 gap-2 items-center">
        <button
          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-700 hover:to-cyan-700"
          onClick={startCall}
          disabled={!!match}
        >
          <Phone />
        </button>
        <button
          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-700 hover:to-orange-700"
          onClick={endCall}
          disabled={!match}
        >
          <PhoneOff />
        </button>
      </div>
      <div className="flex flex-col md:flex-row">
        <div>
          {role === "caller" && <VideoFrameSender />}
          {role === "reciever" && <VideoFrameReciever />}
        </div>
        {match && (
          <div className="h-[75vh] mx-2 md:mx-0 md:w-[55vw] bg-gray-900 rounded-xl md:mt-2.5">
            <Chat />
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCall;

function VideoFrameSender() {
  const { match, socket, connectSocket } = useAuthStore();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const iceCandidatesQueue = useRef([]);
  const sendersPC = useRef(null);


  useEffect(() => {
    if (match) {
      const startCall = async () => {
        sendersPC.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        });

        sendersPC.current.onnegotiationneeded = async () => {
          // console.log("sendersPC: negotiation needed");
          const offer = await sendersPC.current.createOffer();
          await sendersPC.current.setLocalDescription(offer);
          socket.emit("sp-send-offer", {
            sdp: sendersPC.current.localDescription,
            to: match,
          });
          // console.log("sendersPC: offer sent");
        };

        socket.on("sp-receive-answer", async ({ sdp }) => {
          // console.log("sendersPC: answer received");
          await sendersPC.current.setRemoteDescription(sdp);
          // console.log("sendersPC: remote description set");
          while (iceCandidatesQueue.current.length) {
            const candidate = iceCandidatesQueue.current.shift();
            await sendersPC.current.addIceCandidate(candidate);
            // console.log("sendersPC: queued ICE candidate added");
          }
        });

        sendersPC.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("sp-send-ice-candidate", {
              candidate: e.candidate,
              to: match,
            });
            // console.log("sendersPC: ICE candidate sent", e.candidate);
          }
        };

        socket.on("sp-receive-ice-candidate", async ({ candidate }) => {
          if (sendersPC.current.remoteDescription) {
            await sendersPC.current.addIceCandidate(candidate);
            // console.log("sendersPC: ICE candidate added", candidate);
          } else {
            iceCandidatesQueue.current.push(candidate);
            console.log("sendersPC: ICE candidate queued", candidate);
          }
        });

        sendersPC.current.onconnectionstatechange = () => {
          console.log(
            `sendersPC: connection state - ${sendersPC.current.connectionState}`
          );
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        stream
          .getTracks()
          .forEach((track) => sendersPC.current.addTrack(track, stream));
        console.log("sendersPC: tracks added", stream.getTracks());

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("sendersPC: local video stream set");
        }

        sendersPC.current.ontrack = (event) => {
          console.log("sendersPC: track received", event);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log("sendersPC: remote video stream set");
          } else {
            console.error("sendersPC: remoteVideoRef is not available yet.");
          }
        };
      };

      startCall();
    } else {
      if (sendersPC.current) {
        sendersPC.current.close();
        sendersPC.current = null;
        console.log("sendersPC: track stopped");
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [match]);

  return (
    <div className="lg:w-[40vw] rounded-xl">
      <div className="video-container flex flex-col justify-between items-center md:gap-4 gap-2 m-2 mt-2.5 rounded-xl">
        <div className="p-1 rounded-3xl bg-gray-900">
          <video
            ref={localVideoRef}
            muted
            autoPlay
            playsInline
            className="h-[35vh] aspect-[16/9] rounded-3xl"
          />
        </div>
        {match && (
          <div className="p-1 rounded-3xl bg-gray-900">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-[35vh] aspect-[16/9] rounded-3xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function VideoFrameReciever() {
  const { match, socket } = useAuthStore();
  const remoteVideoRef = useRef();
  const localVideoRef = useRef();
  const iceCandidatesQueue = useRef([]);
 
  const sendersPC = useRef(null);

  useEffect(() => {
    if (match) {
      const startCall = async () => {
        sendersPC.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        });

        socket.on("sp-receive-offer", async ({ sdp, from }) => {
          console.log("sendersPC: offer received");
          await sendersPC.current.setRemoteDescription(sdp);
          const answer = await sendersPC.current.createAnswer();
          await sendersPC.current.setLocalDescription(answer);
          socket.emit("sp-send-answer", {
            sdp: sendersPC.current.localDescription,
            to: match,
          });
          console.log("sendersPC: answer sent");
        });

        sendersPC.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("sp-send-ice-candidate", {
              candidate: e.candidate,
              to: match,
            });
            console.log("sendersPC: ICE candidate sent", e.candidate);
          }
        };

        socket.on("sp-receive-ice-candidate", async ({ candidate }) => {
          if (sendersPC.current.remoteDescription) {
            await sendersPC.current.addIceCandidate(candidate);
            console.log("sendersPC: ICE candidate added", candidate);
          } else {
            iceCandidatesQueue.current.push(candidate);
            console.log("sendersPC: ICE candidate queued", candidate);
          }
        });

        sendersPC.current.onconnectionstatechange = () => {
          console.log(
            `sendersPC: connection state - ${sendersPC.current.connectionState}`
          );
        };

        sendersPC.current.ontrack = (event) => {
          console.log("sendersPC: track received", event);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log("sendersPC: remote video stream set");
          } else {
            console.error("sendersPC: remoteVideoRef is not available yet.");
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        stream
          .getTracks()
          .forEach((track) => sendersPC.current.addTrack(track, stream));
        console.log("sendersPC: tracks added", stream.getTracks());

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("sendersPC: local video stream set");
        }
      };
      startCall();
    } else {
      if (sendersPC.current) {
        sendersPC.current.close();
        sendersPC.current = null;
        console.log("sendersPC: track stopped");
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [match]);

  return (
    <div className="lg:w-[40vw] rounded-xl">
      <div className="video-container flex flex-col justify-between items-center md:gap-4 gap-2 m-2 mt-2.5 rounded-xl">
        <div className="p-1 rounded-3xl bg-gray-900">
          <video
            ref={localVideoRef}
            muted
            autoPlay
            playsInline
            className="h-[35vh] aspect-[16/9] rounded-3xl"
          />
        </div>
        {match && (
          <div className="p-1 rounded-3xl bg-gray-900">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-[35vh] aspect-[16/9] rounded-3xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
