import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is where admins can manage users, interviews, and system settings.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
