import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Grid, MenuItem, Alert, Autocomplete } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    candidateId: '',
    scheduledAt: '',
    duration: 60,
    questions: []
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get('/api/users?role=candidate&limit=50');
        setCandidates(res.data.data || []);
      } catch {}
    };
    fetchCandidates();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        candidateId: form.candidateId,
        scheduledAt: form.scheduledAt,
        duration: Number(form.duration),
        questions: form.questions
      };
      const res = await axios.post('/api/interviews', payload);
      navigate(`/interview/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create Interview
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} multiline minRows={3} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={candidates}
                getOptionLabel={(o) => o.name + ' (' + o.email + ')'}
                onChange={(e, val) => setForm({ ...form, candidateId: val?._id || '' })}
                renderInput={(params) => <TextField {...params} label="Select Candidate" required />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="datetime-local" label="Scheduled At" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" label="Duration (mins)" name="duration" value={form.duration} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Creating...' : 'Create Interview'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateInterview;
