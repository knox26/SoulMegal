import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  messages: [],
  setMessages: (message) => {
    const { messages } = get();
    set({ messages: [...messages, message] });
  },

  setMessagesNull: ()=>{

    set({messages : null})
  }

}));
