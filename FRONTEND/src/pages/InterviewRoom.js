import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, TextField, Button, List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const InterviewRoom = () => {
  const { id } = useParams();
  const { socket, joinInterview, leaveInterview, sendMessage, sendCodeChange, sendOffer, sendAnswer, sendIceCandidate, sendEndInterview } = useSocket();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [code, setCode] = useState('// Start coding...');
  const [languageId, setLanguageId] = useState(63); // default JS
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [runOutput, setRunOutput] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const endedOnceRef = useRef(false);

  const languages = [
  { id: 50, label: 'C (GCC)', editor: 'c' },
  { id: 54, label: 'C++ (G++ 17)', editor: 'cpp' },
  { id: 62, label: 'Java (OpenJDK 13)', editor: 'java' },
  { id: 63, label: 'JavaScript (Node.js)', editor: 'javascript' },
  { id: 71, label: 'Python (3.8)', editor: 'python' }
  ];

  useEffect(() => {
    joinInterview(id);
    // load history
    axios.get(`/api/interviews/${id}/messages`).then(res => setMessages(res.data.data)).catch(() => {});

    const onReceive = (data) => {
      // If system end signal received, end and redirect
      if (data?.messageType === 'system:end') {
        try { endCall(); } catch {}
        window.alert('Interview ended from interview side');
        try { navigate('/dashboard'); } catch {}
        try { window.location.assign('/dashboard'); } catch {}
        return;
      }
      setMessages(prev => [...prev, data]);
    };
    const onCode = (data) => {
      setCode(data.code);
    };
    const onOffer = async (data) => {
      await ensurePeer();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      sendAnswer({ interviewId: id, answer });
    };
    const onAnswer = async (data) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    };
    const onIce = async (data) => {
      if (!pcRef.current) return;
      try { await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
    };
    socket?.on('receive-message', onReceive);
    socket?.on('interview-ended', () => {
      try { endCall(); } catch {}
      window.alert('Interview ended from interview side');
      try { navigate('/dashboard'); } catch {}
      try { window.location.assign('/dashboard'); } catch {}
    });
    socket?.on('code-update', onCode);
    socket?.on('offer', onOffer);
    socket?.on('answer', onAnswer);
    socket?.on('ice-candidate', onIce);
    return () => {
      leaveInterview(id);
      socket?.off('receive-message', onReceive);
      socket?.off('code-update', onCode);
      socket?.off('offer', onOffer);
      socket?.off('answer', onAnswer);
      socket?.off('ice-candidate', onIce);
      socket?.off('interview-ended');
    };
  }, [id, socket]);

  // Fallback: poll interview status to ensure candidate redirects even if sockets/messages fail
  useEffect(() => {
    const interval = setInterval(async () => {
      if (endedOnceRef.current) return;
      try {
        const res = await axios.get(`/api/interviews/${id}`);
        const status = res?.data?.data?.status;
        if (status === 'completed') {
          endedOnceRef.current = true;
          try { endCall(); } catch {}
          window.alert('Interview ended from interview side');
          try { navigate('/dashboard'); } catch {}
          try { window.location.assign('/dashboard'); } catch {}
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const selected = languages.find(l => l.id === languageId);
    if (selected) setEditorLanguage(selected.editor);
  }, [languageId]);

  const handleSend = () => {
    if (!input.trim()) return;
    const payload = { interviewId: id, senderId: user.id || user._id, message: input, messageType: 'text' };
    sendMessage(payload);
    setInput('');
  };

  const handleCodeChange = (value) => {
    setCode(value);
    sendCodeChange({ interviewId: id, code: value });
  };

  const runCode = async () => {
    try {
      setRunOutput('Running...');
      const res = await axios.post(`/api/interviews/${id}/execute`, {
        source_code: code,
        language_id: languageId,
        stdin: ''
      });
      const out = res.data?.data?.stdout || res.data?.data?.compile_output || res.data?.data?.stderr || res.data?.message || '';
      setRunOutput(out);
    } catch (e) {
      setRunOutput('Execution failed. Please try again or change language.');
    }
  };

  const endInterview = async () => {
    const confirmed = window.confirm('Really want to end the interview?');
    if (!confirmed) return;
    // Try to inform the other side, but do not block UI
    try { sendEndInterview({ interviewId: id, by: user?.role || 'interviewer' }); } catch {}
    try { sendMessage({ interviewId: id, senderId: (user && (user.id || user._id)) || undefined, message: 'Interview ended from interview side', messageType: 'system:end' }); } catch {}
    try { endCall(); } catch {}
    window.alert('Interview ended');
    // Persist on server in background
    try {
      fetch(`/api/interviews/${id}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        keepalive: true
      }).catch(() => {});
    } catch {}
    // Force navigation regardless of any earlier errors
    try { navigate('/dashboard'); } catch {}
    try { window.location.assign('/dashboard'); } catch {}
  };

  const ensurePeer = async () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendIceCandidate({ interviewId: id, candidate: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };
    pcRef.current = pc;
    return pc;
  };

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    const pc = await ensurePeer();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendOffer({ interviewId: id, offer });
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach(s => { try { if (s.track) s.track.stop(); } catch {} });
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 1, height: '75vh' }}>
            <Editor height="100%" language={editorLanguage} value={code} onChange={handleCodeChange} options={{ fontSize: 14 }} />
          </Paper>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="lang-label">Language</InputLabel>
              <Select labelId="lang-label" label="Language" value={languageId} onChange={(e) => setLanguageId(e.target.value)}>
                {languages.map(l => (
                  <MenuItem key={l.id} value={l.id}>{l.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={runCode}>Run</Button>
            {(user?.role === 'interviewer' || user?.role === 'admin') && (
              <Button color="error" variant="outlined" onClick={endInterview}>End Interview</Button>
            )}
            <Paper sx={{ p: 1, flex: 1 }}>
              <Typography variant="subtitle2">Output</Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{runOutput}</pre>
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Video</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '50%' }} />
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '50%' }} />
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={startCall}>Start Call</Button>
              <Button variant="outlined" onClick={endCall}>End Call</Button>
            </Box>
          </Paper>
          <Paper sx={{ p: 1, mt: 2, height: '60vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Chat</Typography>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List>
                {messages.map((m, idx) => {
                  const senderName = m?.sender?.name || (m?.senderName) || (m?.sender === (user?.id || user?._id) ? 'You' : '');
                  const senderRole = m?.sender?.role ? ` (${m.sender.role})` : '';
                  const time = new Date(m.createdAt || Date.now()).toLocaleTimeString();
                  return (
                    <ListItem key={idx}>
                      <ListItemText primary={m.message} secondary={`${senderName}${senderRole} • ${time}`} />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField fullWidth size="small" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
              <Button variant="contained" onClick={handleSend}>Send</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InterviewRoom;
