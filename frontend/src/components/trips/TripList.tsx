import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Typography, Grid, Box, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// This would be replaced with actual Redux actions and selectors
// import { fetchTrips, deleteTrip } from '../../redux/slices/tripSlice';
// import { RootState } from '../../redux/store';

interface Trip {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

const TripList: React.FC = () => {
  // This would be replaced with Redux state
  // const dispatch = useDispatch();
  // const { trips, loading, error } = useSelector((state: RootState) => state.trips);
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This would be replaced with Redux action
    // dispatch(fetchTrips());
    
    // Mock data for now
    setLoading(true);
    setTimeout(() => {
      setTrips([
        {
          id: 1,
          name: 'Business Trip to New York',
          description: 'Annual conference and client meetings',
          start_date: '2025-07-15',
          end_date: '2025-07-20',
          status: 'approved'
        },
        {
          id: 2,
          name: 'Team Retreat in San Francisco',
          description: 'Team building and planning session',
          start_date: '2025-08-10',
          end_date: '2025-08-15',
          status: 'pending_approval'
        },
        {
          id: 3,
          name: 'Client Visit in London',
          description: 'Meeting with potential clients',
          start_date: '2025-09-05',
          end_date: '2025-09-10',
          status: 'draft'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDeleteTrip = (id: number) => {
    // This would be replaced with Redux action
    // dispatch(deleteTrip(id));
    
    // Mock delete for now
    setTrips(trips.filter(trip => trip.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending_approval':
        return 'warning';
      case 'draft':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) return <Typography>Loading trips...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">My Trips</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/trips/new"
        >
          New Trip
        </Button>
      </Box>

      {trips.length === 0 ? (
        <Typography>No trips found. Create your first trip!</Typography>
      ) : (
        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid item xs={12} md={6} lg={4} key={trip.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="h2" gutterBottom>
                      {trip.name}
                    </Typography>
                    <Chip 
                      label={trip.status.replace('_', ' ')} 
                      color={getStatusColor(trip.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {trip.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      component={Link}
                      to={`/trips/${trip.id}/edit`}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TripList;
