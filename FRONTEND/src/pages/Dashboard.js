import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  Assessment,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Auto-refresh for candidates to reflect when interviewer starts
  useEffect(() => {
    if (user.role !== 'candidate') return;
    const interval = setInterval(() => {
      fetchInterviews();
    }, 5000);
    return () => clearInterval(interval);
  }, [user.role]);

  const fetchInterviews = async () => {
    try {
      const res = await axios.get('/api/interviews');
      setInterviews(res.data.data);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (id) => {
    try {
      await axios.put(`/api/interviews/${id}/start`);
      await fetchInterviews();
    } catch (e) {
      console.error('Failed to start interview', e);
    }
  };

  const endInterview = async (id) => {
    try {
      await axios.put(`/api/interviews/${id}/end`);
      await fetchInterviews();
    } catch (e) {
      console.error('Failed to end interview', e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const upcomingInterviews = interviews.filter(interview => 
    new Date(interview.scheduledAt) > new Date() && interview.status === 'scheduled'
  );

  const recentInterviews = interviews.filter(interview => 
    interview.status === 'completed' || interview.status === 'cancelled'
  ).slice(0, 5);

  const inProgressInterviews = interviews.filter(interview => interview.status === 'in-progress');

  const canJoin = (interview) => {
    const now = new Date();
    const scheduled = new Date(interview.scheduledAt);
    const earlyWindowMs = 10 * 60 * 1000; // allow join 10 mins early
    return interview.status === 'in-progress' || (interview.status === 'scheduled' && (now.getTime() + earlyWindowMs) >= scheduled.getTime());
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user.role === 'candidate' 
            ? 'Manage your upcoming interviews and track your progress.'
            : 'Manage your interviews and candidates.'
          }
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VideoCall color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {interviews.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Interviews
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {upcomingInterviews.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {interviews.filter(i => i.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {user.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Role
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Interviews */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Interviews
            </Typography>
            {upcomingInterviews.length === 0 ? (
              <Typography color="text.secondary">
                No upcoming interviews scheduled.
              </Typography>
            ) : (
              <List>
                {upcomingInterviews.map((interview, index) => (
                  <React.Fragment key={interview._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <VideoCall />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={interview.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(interview.scheduledAt), 'PPP p')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.role === 'candidate' 
                                ? `Interviewer: ${interview.interviewer.name}`
                                : `Candidate: ${interview.candidate.name}`
                              }
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={interview.status} color={getStatusColor(interview.status)} size="small" />
                        {user.role === 'interviewer' && interview.status === 'scheduled' && (
                          <Button size="small" variant="contained" onClick={() => startInterview(interview._id)}>Start</Button>
                        )}
                        {user.role === 'interviewer' && interview.status === 'in-progress' && (
                          <Button size="small" variant="outlined" onClick={() => endInterview(interview._id)}>End</Button>
                        )}
                        {user.role === 'candidate' && canJoin(interview) && (
                          <Button size="small" variant="contained" onClick={() => navigate(`/interview/${interview._id}`)}>Join</Button>
                        )}
                      </Box>
                    </ListItem>
                    {index < upcomingInterviews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Active (In-Progress) Interviews */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Interviews
            </Typography>
            {inProgressInterviews.length === 0 ? (
              <Typography color="text.secondary">
                No active interviews.
              </Typography>
            ) : (
              <List>
                {inProgressInterviews.map((interview, index) => (
                  <React.Fragment key={interview._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <VideoCall />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={interview.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Started: {interview.startedAt ? format(new Date(interview.startedAt), 'PPP p') : 'Just now'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.role === 'candidate' 
                                ? `Interviewer: ${interview.interviewer?.name || ''}`
                                : `Candidate: ${interview.candidate?.name || ''}`}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={interview.status} color={getStatusColor(interview.status)} size="small" />
                        {user.role === 'interviewer' && (
                          <Button size="small" variant="outlined" onClick={() => endInterview(interview._id)}>End</Button>
                        )}
                        {user.role === 'candidate' && (
                          <Button size="small" variant="contained" onClick={() => navigate(`/interview/${interview._id}`)}>Join</Button>
                        )}
                      </Box>
                    </ListItem>
                    {index < inProgressInterviews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* My Interviews (fallback list with Join visibility) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Interviews
            </Typography>
            {interviews.length === 0 ? (
              <Typography color="text.secondary">No interviews found.</Typography>
            ) : (
              <List>
                {interviews.map((interview, index) => (
                  <React.Fragment key={interview._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <VideoCall />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={interview.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(interview.scheduledAt), 'PPP p')} • Status: {interview.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.role === 'candidate' ? `Interviewer: ${interview.interviewer?.name || ''}` : `Candidate: ${interview.candidate?.name || ''}`}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={interview.status} color={getStatusColor(interview.status)} size="small" />
                        {user.role === 'candidate' && (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!canJoin(interview)}
                            onClick={() => navigate(`/interview/${interview._id}`)}
                          >
                            Join
                          </Button>
                        )}
                        {user.role === 'interviewer' && interview.status === 'scheduled' && (
                          <Button size="small" variant="contained" onClick={() => startInterview(interview._id)}>Start</Button>
                        )}
                        {user.role === 'interviewer' && interview.status === 'in-progress' && (
                          <Button size="small" variant="outlined" onClick={() => endInterview(interview._id)}>End</Button>
                        )}
                      </Box>
                    </ListItem>
                    {index < interviews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Interviews */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Interviews
            </Typography>
            {recentInterviews.length === 0 ? (
              <Typography color="text.secondary">
                No recent interviews.
              </Typography>
            ) : (
              <List>
                {recentInterviews.map((interview) => (
                  <ListItem key={interview._id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={interview.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(interview.scheduledAt), 'MMM dd, yyyy')}
                          </Typography>
                          <Chip 
                            label={interview.status} 
                            color={getStatusColor(interview.status)}
                            size="small"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
