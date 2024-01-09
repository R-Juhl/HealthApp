// Threads.js
import { useState, useEffect } from 'react';
import './Threads.css';
import { useContext } from 'react';
import UserIdContext from '../contexts/UserIdContext';

import { FaPen, FaRegSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

function Threads({ setCurrentView, setSelectedThreadId }) {
  const { loggedInUserId } = useContext(UserIdContext);
  const [threads, setThreads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 9;
  const maxPagesVisible = 5;
  const [editingTitle, setEditingTitle] = useState({});
  const [editedTitle, setEditedTitle] = useState({});

  // Function to fetch threads
  const fetchThreads = async () => {
    const response = await fetch('http://localhost:5000/get_user_threads', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: loggedInUserId })
    });
    const data = await response.json();
    setThreads(data.threads.reverse());
  };

  useEffect(() => {
    const cleanupEmptyThreads = async () => {
      await fetch('http://localhost:5000/cleanup_empty_threads', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: loggedInUserId })
      });
    };

    // Call cleanup and fetch threads
    cleanupEmptyThreads().then(fetchThreads);
  }, [loggedInUserId]);

  const handleEditClick = (threadId, title) => {
    setEditingTitle({ ...editingTitle, [threadId]: true });
    setEditedTitle({ ...editedTitle, [threadId]: title });
  };

  const useOutsideAlerter = (ref, threadId) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setEditingTitle((prev) => ({ ...prev, [threadId]: false }));
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);
  }

  const handleSaveClick = async (threadId) => {
    const response = await fetch('http://localhost:5000/update_thread_title', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ thread_id: threadId, title: editedTitle[threadId] })
    });
    if (response.ok) {
      fetchThreads(); // Reload threads to reflect changes
    }
    setEditingTitle({ ...editingTitle, [threadId]: false });
  };

  const handleTitleChange = (e, threadId) => {
    setEditedTitle({ ...editedTitle, [threadId]: e.target.value });
  };

  const handleDeleteClick = async (threadId) => {
    if (window.confirm("Are you sure you want to delete this thread?")) {
      const response = await fetch('http://localhost:5000/delete_thread', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ thread_id: threadId })
      });
      if (response.ok) {
        fetchThreads(); // Reload threads to reflect deletion
      }
    }
  };

  const handleThreadClick = (threadId) => {
    // Navigate to Bot.js with the selected thread ID
    setCurrentView('Bot');
    setSelectedThreadId(threadId);
  };

  // Pagination logic
  const indexOfLastThread = currentPage * threadsPerPage;
  const indexOfFirstThread = indexOfLastThread - threadsPerPage;
  const currentThreads = threads.slice(indexOfFirstThread, indexOfLastThread);

  const totalPages = Math.ceil(threads.length / threadsPerPage);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Conditional Welcome Message
  const welcomeMessage = loggedInUserId ? (
    <p>Click on a thread to open a previous conversation.</p>
  ) : (
    <p>Log in to see saved threads here.</p>
  );

  // Render Page Numbers
  const renderPageNumbers = () => {
    const pageNumbers = [];
    let maxPageNumber = Math.min(currentPage + 2, totalPages);
    let minPageNumber = Math.max(currentPage - 2, 1);

    if (maxPageNumber - minPageNumber < maxPagesVisible - 1) {
      maxPageNumber = Math.min(minPageNumber + maxPagesVisible - 1, totalPages);
      minPageNumber = Math.max(maxPageNumber - maxPagesVisible + 1, 1);
    }

    for (let i = minPageNumber; i <= maxPageNumber; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers.map(number => (
      <button 
        key={number} 
        onClick={() => changePage(number)} 
        className={currentPage === number ? 'page-number current' : 'page-number'}>
        {number}
      </button>
    ));
  };

  return (
    <div className="threads-container">
      <h1>Threads</h1>
      {welcomeMessage}
      <div className="threads-list">
        {currentThreads.map(thread => (
          <div key={thread.thread_id} className="thread-box">
            {editingTitle[thread.thread_id] ? (
              <input
                type="text"
                value={editedTitle[thread.thread_id]}
                onChange={(e) => handleTitleChange(e, thread.thread_id)}
                className="thread-title-input"
                onBlur={() => setEditingTitle({ ...editingTitle, [thread.thread_id]: false })}
              />
            ) : (
              <h2 onClick={() => handleThreadClick(thread.thread_id)}>{thread.title || "Untitled Thread"}</h2>
            )}
            <p>{thread.date}</p>
            {editingTitle[thread.thread_id] ? (
              <FaRegSave className="save-icon" onClick={() => handleSaveClick(thread.thread_id)} />
            ) : (
              <FaPen className="edit-icon" onClick={() => handleEditClick(thread.thread_id, thread.title)} />
            )}
            <MdDeleteForever className="delete-icon" onClick={() => handleDeleteClick(thread.thread_id)} />
          </div>
        ))}
      </div>
      <div className="page-navigation">
        <button onClick={() => changePage(1)} disabled={currentPage === 1}>&laquo;</button>
        {currentPage > 3 && <span>...</span>}
        {renderPageNumbers()}
        {currentPage < totalPages - 2 && <span>...</span>}
        <button onClick={() => changePage(totalPages)} disabled={currentPage === totalPages}>&raquo;</button>
      </div>
    </div>
  );
}

export default Threads;