'use client';

import Link from 'next/link';
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          py: 6,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 700 }}
        >
          English Learner
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 520 }}>
          Choose a mode to get started. Learn each word with images and pronunciation, or test yourself in the
          Guess Word Game.
        </Typography>

        <Stack spacing={3} sx={{ width: '100%' }}>
          <Card
            elevation={4}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MenuBookIcon color="primary" sx={{ fontSize: 42 }} />
                <Box>
                  <Typography variant="h5">Start Learning Words</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explore every word card with images and audio pronunciation.
                  </Typography>
                </Box>
              </Box>
              <Button component={Link} href="/words" variant="contained" size="large">
                Go
              </Button>
            </CardContent>
          </Card>

          <Card
            elevation={4}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'secondary.main',
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SportsEsportsIcon color="secondary" sx={{ fontSize: 42 }} />
                <Box>
                  <Typography variant="h5">Play Guess Word Game</Typography>
                  <Typography variant="body2" color="text.secondary">
                    See the image, hear the word, and choose the correct answer from five options.
                  </Typography>
                </Box>
              </Box>
              <Button component={Link} href="/guess" variant="outlined" size="large" color="secondary">
                Play
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
