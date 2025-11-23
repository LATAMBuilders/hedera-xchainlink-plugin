import { Message } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hedera-xchainlink-plugin.onrender.com/api/chat';

export const sendMessageToAI = async (messages: Message[]): Promise<string> => {
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content;
  const username = lastMessage.username || 'User';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, message: content }),
    });

    if (!response.ok) {
      throw new Error('Error al procesar el mensaje');
    }

    const data = await response.json();
    return data.aiResponse.message;
  } catch (error) {
    console.error('Error calling chat API:', error);
    return "Error: Could not connect to the server. Please ensure the backend is running.";
  }
};
