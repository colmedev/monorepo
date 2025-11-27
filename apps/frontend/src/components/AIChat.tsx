import { useState } from 'react';
import { DefaultChatTransport, } from 'ai';
import { useChat } from '@ai-sdk/react'
import { Streamdown } from 'streamdown';

export default function AIChat() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat'
    }),
    messages: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ text: input });
    setInput('');
  };



  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>AI Chat</h2>

      {messages.map(message => (
        <div key={message.id}>
          {message.parts.map((part, idx) =>
            part.type === 'text' ? (
              <Streamdown key={idx}>{part.text}</Streamdown>
            ) : null
          )}
        </div>
      ))}

      {error && (
        <div style={{ color: 'red' }}>
          Error: {error?.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={status === 'streaming'}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />
        <button
          type="submit"
          disabled={status === 'streaming'}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: status === 'streaming' ? '#ccc' : '#007bff',
            color: 'white',
            fontSize: '14px',
            cursor: status === 'streaming' ? 'not-allowed' : 'pointer'
          }}
        >
          {status === 'streaming' ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}