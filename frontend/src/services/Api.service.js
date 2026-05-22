import AxiosClient from "./Axios.service.js";
import qs from "qs";
import { setVariable } from "../utils/localStorage.js";
import { apiBaseUrl } from '../constants/constant.js';  
import { getVariable } from '../utils/localStorage.js';

const ApiService = {
  login: async (payload) => {
    const { data, loading, error } = await AxiosClient({
      method: "POST",
      url: `user/login`,
      data: payload,
    });
    if (data ) {
      setVariable("km_user_token", data.result.token);
    }
    return { data, error, loading };
  },

   register: async (payload) => {
    const { data, loading, error } = await AxiosClient({
      method: "POST",
      url: `user/register`,
      data: payload,
    });
    
    return { data, error, loading };
  },

   getAllChatBots: async () => {
    const { data, loading, error } = await AxiosClient({
      method: "GET",
      url: `chat-bot/all`,
    });
    
    return { data, error, loading };
  },

   createChatBot: async (payload) => {
    const { data, loading, error } = await AxiosClient({
      method: "POST",
      url: `chat-bot/`,
      data:payload
    });
    
    return { data, error, loading };
  },

  //*********************************** */
    // ✅ DELETE CHATBOT (FIXED)
  deleteChatBot: async (botId) => {
    const { data, loading, error } = await AxiosClient({
      method: "DELETE",
      url: `chat-bot/chatbot/${botId}`,
    });
    return { data, error, loading };
  },


   getAllFiles: async (chatBotId) => {
    const { data, loading, error } = await AxiosClient({
      method: "GET",
      url: `files?chatBotId=${chatBotId}`
    });
    
    return { data, error, loading };
  },

  uploadFile: async (payload) => {
    const { data, loading, error } = await AxiosClient({
      method: "POST",
      url: `files/fileUpload`,
      data:payload,
      contentType:'multipart/form-data'
    });
    
    return { data, error, loading };
  },
  deleteFile: async (payload) => {
    const { data, loading, error } = await AxiosClient({
      method: "DELETE",
      url: `files/file`,
      data:payload
    });
    
    return { data, error, loading };
  },

  getConversations: async (chatbotId = null, namespaceId = null) => {
    let url = `chat-bot/conversations?`;
    if (chatbotId) url += `chatbot_id=${chatbotId}&`;
    if (namespaceId) url += `namespace_id=${namespaceId}`;
    const { data, loading, error } = await AxiosClient({
      method: "GET",
      url: url,
    });
    return { data, error, loading };
  },

  

  
};

/**
 * Streams conversation response and calls onChunk for each parsed chunk.
 * onChunk receives either a string or parsed object depending on server.
 * Returns an AbortController for cancellation.
 */
export const startConversation = async (payload, onChunk) => {
  const token = getVariable('km_user_token');
  const abortController = new AbortController();

  try {
    const response = await fetch(`${apiBaseUrl}chat-bot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk and pass it through AS-IS to preserve all formatting
        // This includes newlines, spaces, and all whitespace
        const chunkStr = decoder.decode(value, { stream: true });
        
        if (chunkStr) {
          // Pass the chunk directly without any processing
          // This preserves all newlines and formatting from the backend
          onChunk(chunkStr);
        }
      }
    } finally {
      try { reader.releaseLock(); } catch (e) {}
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request aborted by user');
      throw error;
    }
    throw error;
  }

  return abortController;
};

export default ApiService;
