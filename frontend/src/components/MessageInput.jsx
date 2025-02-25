import { useForm, Controller } from "react-hook-form";

import { Send, X } from "lucide-react";
import { Input } from "./ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";


const MessageInput = () => {
  const { match, socket } = useAuthStore();
  const { setMessages } = useChatStore();

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      text: "",
      to: null,
    },
  });

  const onSubmit = async (data) => {
    if (!data.text.trim()) return;
    data.to = match;
    setMessages({ text: data.text, to: data.to });
    console.log(data);
    socket.emit("send-message", { msg: data.text, to: data.to });
    reset();
  };

  return (
    <div className="p-4 w-full ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2"
      >
        <div className="flex-1 flex gap-2">
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                className="w-full rounded-lg text-white"
                placeholder="Type a message..."
              />
            )}
          />
        </div>
        <button
          type="submit"
          className="bg-gray-500 hover:bg-gray-600 p-2.5 flex justify-center items-center rounded-full"
          disabled={!watch("text")}
        >
          <Send size={22} className="-mb-0.5 -ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
