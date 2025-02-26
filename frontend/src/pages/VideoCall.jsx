import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Phone, PhoneOff } from "lucide-react";
import Chat from "@/components/Chat";
import { useChatStore } from "@/store/useChatStore";

function VideoCall() {
  const { authUser, match, setMatch, socket, role, setRole } = useAuthStore();
  const { setMessagesNull } = useChatStore();
  const sendersPC = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    const startStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (match) {
        sendersPC.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });

        if (role === "caller") {
          sendersPC.current.onnegotiationneeded = async () => {
            try {
              const offer = await sendersPC.current.createOffer();
              await sendersPC.current.setLocalDescription(offer);
              socket.emit("sp-send-offer", {
                sdp: sendersPC.current.localDescription,
                to: match,
              });
            } catch (error) {
              console.error("Error creating offer:", error);
            }
          };

          socket.on("sp-receive-answer", async ({ sdp }) => {
            try {
              if (
                sendersPC.current &&
                sendersPC.current.signalingState === "have-local-offer"
              ) {
                await sendersPC.current.setRemoteDescription(sdp);
                while (iceCandidatesQueue.current.length) {
                  const candidate = iceCandidatesQueue.current.shift();
                  await sendersPC.current.addIceCandidate(candidate);
                }
              }
            } catch (error) {
              console.error("Error setting remote description:", error);
            }
          });

          sendersPC.current.onicecandidate = (e) => {
            if (e.candidate) {
              socket.emit("sp-send-ice-candidate", {
                candidate: e.candidate,
                to: match,
              });
            }
          };

          socket.on("sp-receive-ice-candidate", async ({ candidate }) => {
            if (sendersPC.current.remoteDescription) {
              await sendersPC.current.addIceCandidate(candidate);
            } else {
              iceCandidatesQueue.current.push(candidate);
            }
          });

          stream
            .getTracks()
            .forEach((track) => sendersPC.current.addTrack(track, stream));

          sendersPC.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };
        }

        if (role === "receiver") {
          socket.on("sp-receive-offer", async ({ sdp, from }) => {
            try {
              if (
                !sendersPC.current ||
                sendersPC.current.signalingState === "closed"
              ) {
                return;
              }

              if (sendersPC.current.signalingState !== "stable") {
                return;
              }

              await sendersPC.current.setRemoteDescription(
                new RTCSessionDescription(sdp)
              );

              const answer = await sendersPC.current.createAnswer();
              await sendersPC.current.setLocalDescription(answer);

              socket.emit("sp-send-answer", {
                sdp: sendersPC.current.localDescription,
                to: match,
              });
            } catch (error) {
              console.error("Error in offer handling:", error);
            }
          });

          sendersPC.current.onicecandidate = (e) => {
            if (e.candidate) {
              socket.emit("sp-send-ice-candidate", {
                candidate: e.candidate,
                to: match,
              });
            }
          };

          socket.on("sp-receive-ice-candidate", async ({ candidate }) => {
            try {
              if (
                !sendersPC.current ||
                sendersPC.current.signalingState === "closed"
              ) {
                return;
              }

              if (sendersPC.current.remoteDescription) {
                await sendersPC.current.addIceCandidate(
                  new RTCIceCandidate(candidate)
                );
              } else {
                iceCandidatesQueue.current.push(candidate);
              }
            } catch (error) {
              console.error("Error handling ICE candidate:", error);
            }
          });

          sendersPC.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };

          stream
            .getTracks()
            .forEach((track) => sendersPC.current.addTrack(track, stream));
        }
      }
    };

    startStream();

    return () => {
      if (sendersPC.current) {
        sendersPC.current.ontrack = null;
        sendersPC.current.onicecandidate = null;
        sendersPC.current.oniceconnectionstatechange = null;
        sendersPC.current.onconnectionstatechange = null;
        sendersPC.current.onnegotiationneeded = null;
        sendersPC.current.close();
        sendersPC.current = null;
      }
    };
  }, [match, role, socket]);

  useEffect(() => {
    socket.on("match-found", ({ match, role }) => {
      setMatch(match);
      setRole(role);
    });

    socket.on("ended-call", ({ msg }) => {
      if (msg === "call ended") {
        if (sendersPC.current) {
          console.log("under endcall if condition");
          sendersPC.current.ontrack = null;
          sendersPC.current.onicecandidate = null;
          sendersPC.current.oniceconnectionstatechange = null;
          sendersPC.current.onconnectionstatechange = null;
          sendersPC.current.onnegotiationneeded = null;
          sendersPC.current.close();
          sendersPC.current = null;
        }
        setMatch(null);
        setMessagesNull();
        setRole(null);
      }
    });
  }, [socket]);

  const startCall = () => {
    socket.emit("find-match", { id: authUser._id });
  };

  const endCall = () => {
    socket.emit("end-call", { to: match, msg: "call ended" });
    if (sendersPC.current) {
      console.log("under endcall if condition");
      sendersPC.current.ontrack = null;
      sendersPC.current.onicecandidate = null;
      sendersPC.current.oniceconnectionstatechange = null;
      sendersPC.current.onconnectionstatechange = null;
      sendersPC.current.onnegotiationneeded = null;
      sendersPC.current.close();
      sendersPC.current = null;
    }
    setMatch(null);
    setMessagesNull();
    setRole(null);
  };

  return (
    <div
      className={`pt-20 flex flex-col justify-center items-center ${
        match ? "" : "h-screen"
      }`}
    >
      <div className="flex justify-center md:gap-5 gap-2 items-center">
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
