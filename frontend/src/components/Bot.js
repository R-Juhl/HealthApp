// Bot.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import './Bot.css';
import UserIdContext from '../contexts/UserIdContext';
//import { useLanguage } from '../contexts/LanguageContext';
//import en from '../languages/en.json';
//import dk from '../languages/dk.json';

import { HiOutlineVolumeUp, HiOutlineVolumeOff, HiPlusCircle, HiMicrophone } from "react-icons/hi";

function Bot({ setCurrentView, selectedThreadId, setSelectedThreadId }) {
  const { loggedInUserId } = useContext(UserIdContext);
  //const { language } = useLanguage();
  //const text = language === 'en' ? en : dk;
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [loadingDots, setLoadingDots] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState('');
  const [errorMessage, setErrorMessage] = useState("");

  const handleTTSButtonClick = async (formattedMessage) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(formattedMessage, 'text/html');
    const messageText = doc.body.textContent || "";

    console.log("handleTTSButtonClick called with messageText:", messageText);
    // If there's currently playing audio, stop it
    if (isPlaying) { //change this to effectively force user to click on stop audio button
      setIsPlaying(false);
      setAudioSrc('');
    }
  
    // Call Flask API to get TTS audio
    const response = await fetch('http://localhost:5000/text_to_speech', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ text: messageText })
    });
    const data = await response.json();
  
    // Use the audio URL from the response to set the audio source
    if (data.audio_url) {
      setAudioSrc(data.audio_url);
      setIsPlaying(true);
    }
  };

  const handleStopAudio = () => {
    setIsPlaying(false);
    setAudioSrc('');
  };

  const fetchInitialMessage = useCallback(async (threadId, userId) => {
    if (!threadId) {
      console.error('No thread ID available for initial message');
      return;
    }
    const response = await fetch(`http://localhost:5000/thread_initial?thread_id=${threadId}&user_id=${userId}`);
    const data = await response.json();
    console.log("log from fetchInitialMessage with data:", data);
    const formattedInitialMessage = formatText(data.message, 'assistant');
    setMessages([formattedInitialMessage]);
  }, []);

  // Load saved thread or create new thread
  useEffect(() => {
    console.log("Received Thread ID in Bot.js from Threads.js:", selectedThreadId);
    const loadThread = async (threadId) => {
      setIsLoading(true);
      try {
        // Load the messages of the selected thread
        const response = await fetch(`http://localhost:5000/get_thread_messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread_id: threadId })
        });
        const data = await response.json();
        if (data.messages) {
          const formattedMessages = data.messages.map(msg => formatText(msg.text, msg.role));
          setMessages(formattedMessages.reverse());
        }
        setThreadId(threadId);
      } catch (error) {
        console.error('Error loading thread:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    const initiateThread = async () => {
      setIsLoading(true);
      try {
        // Create a new thread
        const threadResponse = await fetch('http://localhost:5000/create_new_thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: loggedInUserId })
        });
        const threadData = await threadResponse.json();
        setThreadId(threadData.thread_id);
        await fetchInitialMessage(threadData.thread_id, loggedInUserId);
      } catch (error) {
        console.error('Error handling thread session:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Check if the user is logged in before attempting to load or create a thread
    if (loggedInUserId) {
      if (selectedThreadId) {
        loadThread(selectedThreadId);
      } else {
        initiateThread();
      }
    } else {
      setErrorMessage("You must be logged in to use the Chat Bot");
    }
  }, [selectedThreadId, loggedInUserId, fetchInitialMessage]);
  

  const handleNext = async (userInput) => {
    console.log("handleNext called with userInput:", userInput);
    if(isLoading) return; // Prevent multiple calls while loading
    setIsLoading(true);

    // Add the user's message to the messages state
    setMessages(prevMessages => [...prevMessages, formatText(userInput, 'user')]);

    const response = await fetch('http://localhost:5000/thread_continue', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ thread_id: threadId, user_input: userInput })
    });
    const data = await response.json();
    console.log(data)
    if (data.message) {
      const formattedMessage = formatText(data.message, 'assistant');
      setMessages(prevMessages => [...prevMessages, formattedMessage]);
    }
    setIsLoading(false);

    console.log("Messages length:", messages.length);

    // After receiving a response, check if it's the first user message in the thread
    if (messages.length === 1) {
      // Call function to generate and save thread title only if it's the first user message
      generateThreadTitle(threadId, userInput);
      console.log("Message length === 1, calling generateThreadTitle with threadId:", threadId, "userInput:", userInput);
    }
  };

  // Function to generate and save thread title
  const generateThreadTitle = async (threadId, userInput) => {
    console.log("Generating thread title for Thread ID:", threadId, "User Input:", userInput);
    const response = await fetch('http://localhost:5000/generate_thread_title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: threadId, user_input: userInput })
    });
    const data = await response.json();
    if(data.error) {
        console.error("Error generating title:", data.error);
    } else {
        console.log("Thread title generated:", data.title);
    }
  };

  const handleCustomInput = async () => {
    if (!customMessage.trim()) return;  // Exit if the custom message is empty or only whitespace
  
    setIsLoading(true);
    await handleNext(customMessage);
    setCustomMessage("");
  };

  const handleKeyPress = (e) => {
    // Check if Enter key is pressed and custom message is not empty
    if (e.key === 'Enter' && customMessage.trim()) {
      e.preventDefault();  // Prevent the default action of Enter key in a textarea
      handleCustomInput();
    }
  };

  useEffect(() => {
    let count = 0;
    if (isLoading) {
      const intervalId = setInterval(() => {
        setLoadingDots('.'.repeat(count % 4));
        count++;
      }, 500); // Adjust the timing as needed

      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  const formatText = (text, role = 'assistant') => {
    let formattedText = `<div class='message-box ${role}'>${text}</div>`;
  
    // Replace markdown-like headings with HTML tags
    formattedText = formattedText.replace(/### (.*?)\n/g, "<h3>$1</h3>");
    // Replace bold markdown-like syntax with HTML bold tags
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Replace newline characters with HTML line breaks
    formattedText = formattedText.replace(/\n/g, "<br>");
  
    return formattedText;
  };

  const handleLeaveThread = () => {
    setSelectedThreadId(null);
    setCurrentView('Home');
  };

  return (
    <div className="bot-container">
      <div className="bot-chat-container">
        <h1 className='bot-title'>AI Health Bot</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div>
          {messages.map((formattedMessage, index) => {
            const role = formattedMessage.includes('message-box user') ? 'user' : 'assistant';
            return (
              <div key={index} className={`message-container ${role}`}>
                <div className="message-box" dangerouslySetInnerHTML={{ __html: formattedMessage }}></div>
                <div className="icon-group">
                  {isPlaying 
                    ? <button onClick={handleStopAudio} className="audio-control-button"><HiOutlineVolumeOff /></button>
                    : <button onClick={() => handleTTSButtonClick(formattedMessage)} className="audio-control-button"><HiOutlineVolumeUp /></button>
                  }
                </div>
              </div>
            );
          })}
          {isPlaying && <audio src={audioSrc} autoPlay onEnded={() => setIsPlaying(false)} />}
        </div>
        {isLoading && <p className="loading-text">Loading{loadingDots}</p>}
        <div className='button-container'>
          <>
            <div className="input-option-button-container">
              <button className="input-option-button"><HiPlusCircle /></button>
              <button className="input-option-button"><HiMicrophone /></button>
            </div>
            <div>
            <textarea
              placeholder='Custom input'
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              onKeyPress={handleKeyPress}  // Add this line to handle key press
              className="input-style"
            />
              <button 
                className="button-style" 
                onClick={handleCustomInput}
                disabled={!loggedInUserId} // Disable button if user is not logged in
              >
                Submit
              </button>
            </div>
          </>
          <div>
            <button className="button-style" onClick={handleLeaveThread}>Leave thread</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bot;