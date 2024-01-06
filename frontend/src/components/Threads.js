// Threads.js
import React, { useEffect, useState } from 'react';
import './Threads.css';
import { useContext } from 'react';
import UserIdContext from '../contexts/UserIdContext';

function Threads({ setCurrentView, setSelectedThreadId }) {
  const { loggedInUserId } = useContext(UserIdContext);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchThreads = async () => {
      const response = await fetch('http://localhost:5000/get_user_threads', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: loggedInUserId })
      });
      const data = await response.json();
      setThreads(data.threads);
    };

    fetchThreads();
  }, [loggedInUserId]);

  const handleThreadClick = (threadId) => {
    // Navigate to Bot.js with the selected thread ID
    setCurrentView('Bot');
    setSelectedThreadId(threadId);
  };

  return (
    <div className="threads-container">
      <h1>Threads</h1>
      {threads.map(thread => (
        <div key={thread.thread_id} className="thread-box" onClick={() => handleThreadClick(thread.thread_id)}>
          <h2>{thread.title}</h2>
          <p>{thread.date}</p>
        </div>
      ))}
    </div>
  );
}

export default Threads;