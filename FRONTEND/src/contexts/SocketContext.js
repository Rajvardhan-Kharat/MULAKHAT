import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastInterviewId, setLastInterviewId] = useState(null);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        // Auto rejoin last interview room on connect/reconnect
        if (lastInterviewId) {
          try { newSocket.emit('join-interview', lastInterviewId); } catch {}
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const joinInterview = (interviewId) => {
    setLastInterviewId(interviewId);
    if (socket) {
      socket.emit('join-interview', interviewId);
    }
  };

  const leaveInterview = (interviewId) => {
    if (socket) {
      socket.emit('leave-interview', interviewId);
    }
  };

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send-message', data);
    }
  };

  const sendCodeChange = (data) => {
    if (socket) {
      socket.emit('code-change', data);
    }
  };

  const sendCursorPosition = (data) => {
    if (socket) {
      socket.emit('cursor-position', data);
    }
  };

  const sendOffer = (data) => {
    if (socket) {
      socket.emit('offer', data);
    }
  };

  const sendAnswer = (data) => {
    if (socket) {
      socket.emit('answer', data);
    }
  };

  const sendIceCandidate = (data) => {
    if (socket) {
      socket.emit('ice-candidate', data);
    }
  };

  const sendEndInterview = (data) => {
    if (socket) {
      socket.emit('end-interview', data);
    }
  };

  const value = {
    socket,
    isConnected,
    joinInterview,
    leaveInterview,
    sendMessage,
    sendCodeChange,
    sendCursorPosition,
    sendOffer,
    sendAnswer,
    sendIceCandidate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
