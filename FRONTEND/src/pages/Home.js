import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper
} from '@mui/material';
import {
  VideoCall,
  Code,
  Chat,
  Assessment,
  Security,
  Speed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <VideoCall sx={{ fontSize: 40 }} />,
      title: 'Live Video Interviews',
      description: 'Conduct face-to-face interviews with high-quality video and audio streaming using WebRTC technology.'
    },
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Real-time Code Editor',
      description: 'Collaborative coding environment with syntax highlighting, auto-completion, and live code execution.'
    },
    {
      icon: <Chat sx={{ fontSize: 40 }} />,
      title: 'Live Chat',
      description: 'Real-time messaging system for seamless communication during interviews.'
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'Automated Assessment',
      description: 'Built-in test cases and automated scoring for coding challenges.'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure Platform',
      description: 'JWT authentication, role-based access control, and secure data transmission.'
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Fast & Reliable',
      description: 'Optimized performance with Socket.io for real-time features and MongoDB for data storage.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" component="h1" gutterBottom>
              Welcome to MULAKHAT
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
              The Ultimate Online Interview Platform
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Conduct technical interviews with live video, collaborative coding, 
              real-time chat, and automated assessment. Perfect for recruiters, 
              interviewers, and candidates.
            </Typography>
            {!isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    backgroundColor: 'white', 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'grey.300', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Features
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 6, color: 'text.secondary' }}>
          Everything you need for conducting successful technical interviews
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Paper sx={{ py: 6, mt: 4 }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Start Interviewing?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              Join thousands of companies already using MULAKHAT for their technical interviews.
            </Typography>
            {!isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
              >
                Create Your Account
              </Button>
            )}
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default Home;
