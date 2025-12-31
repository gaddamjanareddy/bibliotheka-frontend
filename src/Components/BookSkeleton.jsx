import { Skeleton, Grid, Card, CardContent, Box } from '@mui/material';

const BookSkeleton = () => {
  return (
    <Grid container spacing={4}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card sx={{ borderRadius: '20px' }}>
            <Skeleton variant="rectangular" height={250} />
            <CardContent>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Skeleton variant="circular" width={30} height={30} />
                <Skeleton variant="circular" width={30} height={30} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BookSkeleton;