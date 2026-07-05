import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Send, Loader } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

function FarmerChat() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Welcome to FarmerAI! I\'m your agronomist assistant. How can I help you with your farming today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/farmer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          chatHistory: messages,
          language,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Farmer Chat - AI Agronomist</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ask Your Agriculture Questions</CardTitle>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>Portuguese</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-300 rounded-lg h-96 overflow-y-auto mb-4 p-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-900'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader size={20} className="animate-spin" />
                Bot is typing...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your agriculture question..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Send size={20} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FarmerChat;