import axios from 'axios';

const API_URL = 'http://localhost:8001/api';

export const getChats = async () => {
    const response = await axios.get(`${API_URL}/chats`);
    return response.data;
};

export const getChatHistory = async (id) => {
    const response = await axios.get(`${API_URL}/chats/${id}`);
    return response.data;
};

export const sendMessage = async (conversationId, prompt, modelName) => {
    const response = await axios.post(`${API_URL}/chat`, {
        conversation_id: conversationId,
        prompt: prompt,
        model_name: modelName
    });
    return response.data;
};