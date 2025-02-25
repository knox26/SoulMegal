import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import React, { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";

function Chat() {
  const {  match, socket } = useAuthStore();
  const messagesEndRef = useRef(null);
  const { messages, setMessages } = useChatStore();
  useEffect(() => {
    socket.on("recieve-message", ({ msg, to }) => {
      setMessages({ text: msg, to: to });
      console.log("message", messages);
    });

    return () => {
      socket.off("recieve-message");
    };
  }, [socket, setMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-auto scrollbar-hide">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-white h-full">
          {messages?.map((message, idx) => (
            <div
              key={`${idx}`}
              className={`flex flex-col  ${
                message.to !== match
                  ? "items-start rounded-bl-2xl"
                  : "items-end"
              }`}
              ref={messagesEndRef}
            >
              <div
                className={`flex flex-col bg-gray-800 p-1.5 px-3 max-w-full md:max-w-3/5 break-words ${
                  message.to !== match
                    ? "rounded-r-xl rounded-bl-xl "
                    : "rounded-l-xl rounded-br-xl"
                }`}
              >
                <>
                  <div className=" text-xs  ">
                    {message.to !== match ? (
                      <p className="pb-0.5 -mt-1 text-gray-400/90 text-start">
                        match
                      </p>
                    ) : (
                      <p className="pb-0.5 -mt-1 text-gray-400/90 text-end">
                        you
                      </p>
                    )}
                  </div>
                  {message.text && <p>{message.text}</p>}
                </>
              </div>
            </div>
          ))}
        </div>
        <MessageInput />
      
    </div>
  );
}

export default Chat;
