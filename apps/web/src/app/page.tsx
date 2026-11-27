import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ColorSchemeToggle } from '@/components/color-scheme-toggle';

const IMPLEMENTED = [
  'TypeScript monorepo with shared domain contracts',
  'Health endpoint at /api/health',
  'Bounded worker bootstrap for Cloud Run Jobs',
  'Google ADK screening boundary (tested without live models)',
  'Local Firestore emulator with synthetic vacancies',
];

const PLANNED = [
  'Ingestion from documented and permitted job APIs',
  'Conservative AI screening: worth exploring, maybe, skip',
  'Personal job inbox with save, dismiss and JobFlow export',
];

function StatusList({ title, items }: { readonly title: string; readonly items: string[] }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem key={item} disableGutters>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default function HomePage() {
  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Chip label="Development foundation — not production ready" color="warning" />
          <ColorSchemeToggle />
        </Stack>

        <Box>
          <Typography component="h1" variant="h2" sx={{ fontWeight: 700 }}>
            JobScout
          </Typography>
          <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
            Find less. Find better.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '65ch' }}>
            JobScout collects vacancies from permitted public sources and performs a conservative
            preliminary screening to answer one question: is this vacancy worth exploring further?
            Detailed analysis and CV adaptation stay in JobFlow.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <StatusList title="Implemented foundation" items={IMPLEMENTED} />
          <StatusList title="Planned next" items={PLANNED} />
        </Stack>
      </Stack>
    </Container>
  );
}
