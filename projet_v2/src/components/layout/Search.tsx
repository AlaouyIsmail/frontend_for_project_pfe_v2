import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import api from '../../api/axios';

interface Result { id: number; label: string; sub: string; type: 'chef'|'ressource'|'rh'; }

export default function Search() {
  const [query, setQuery]       = React.useState('');
  const [results, setResults]   = React.useState<Result[]>([]);
  const [loading, setLoading]   = React.useState(false);
  const [open, setOpen]         = React.useState(false);
  const inputRef                = React.useRef<HTMLElement>(null);
  const timerRef                = React.useRef<ReturnType<typeof setTimeout>>();

  const search = async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const [teamsRes, projRes] = await Promise.allSettled([
        api.get('/dashboard/resources'),
        api.get('/projects'),
      ]);
      const found: Result[] = [];
      if (teamsRes.status === 'fulfilled') {
        const teams: any[] = teamsRes.value.data ?? [];
        teams.forEach((t: any) => {
          const chef = t.chef;
          if (`${chef.first_name} ${chef.last_name}`.toLowerCase().includes(q.toLowerCase()))
            found.push({ id: chef.id, label: `${chef.first_name} ${chef.last_name}`, sub: `Chef · ${Math.round(chef.charge_affectee ?? 0)}% charge`, type: 'chef' });
          (t.resources ?? []).forEach((r: any) => {
            if (`${r.first_name} ${r.last_name}`.toLowerCase().includes(q.toLowerCase()))
              found.push({ id: r.id, label: `${r.first_name} ${r.last_name}`, sub: `Ressource · exp. ${r.niveau_experience}ans`, type: 'ressource' });
          });
        });
      }
      setResults(found.slice(0, 8));
      setOpen(found.length > 0);
    } catch { setResults([]); setOpen(false); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 350);
  };

  const iconFor = (type: string) =>
    type === 'chef' ? <EngineeringRoundedIcon fontSize="small" color="primary" /> : <PersonRoundedIcon fontSize="small" color="success" />;

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <FormControl sx={{ width: { xs:'100%', md:'28ch' } }} ref={inputRef as any}>
        <OutlinedInput
          size="small"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Rechercher…"
          sx={{ flexGrow:1 }}
          startAdornment={
            <InputAdornment position="start" sx={{ color:'text.primary' }}>
              {loading ? <CircularProgress size={16}/> : <SearchRoundedIcon fontSize="small" />}
            </InputAdornment>
          }
        />
        <Popper open={open} anchorEl={inputRef.current} placement="bottom-start" style={{ zIndex:1400, width:320 }}>
          <Paper elevation={8} sx={{ mt:0.5, borderRadius:2, overflow:'hidden' }}>
            {results.length === 0 ? (
              <Typography variant="body2" sx={{ p:2, color:'text.secondary' }}>Aucun résultat</Typography>
            ) : (
              <List dense disablePadding>
                {results.map((r, i) => (
                  <ListItemButton key={i} onClick={() => { setOpen(false); setQuery(''); }}
                    sx={{ py:0.75, '&:hover':{ bgcolor:'action.hover' } }}>
                    <ListItemIcon sx={{ minWidth:32 }}>{iconFor(r.type)}</ListItemIcon>
                    <ListItemText
                      primary={r.label}
                      secondary={r.sub}
                      primaryTypographyProps={{ fontSize:'0.85rem', fontWeight:600 }}
                      secondaryTypographyProps={{ fontSize:'0.72rem' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Popper>
      </FormControl>
    </ClickAwayListener>
  );
}
