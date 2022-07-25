import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { search } from 'redux-manager';

const Search = () => {
  const [text, setText] = React.useState('');

  const timerRef = React.useRef<NodeJS.Timer>();
  React.useEffect(() => {
    clearTimeout(timerRef.current);
    if (text) timerRef.current = setTimeout(() => search(text), 1000);
    else search(text);
  }, [text]);

  const ClearButton = React.useMemo(
    () => (
      <InputAdornment position="end">
        <IconButton edge="end" onClick={() => setText('')}>
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    ),
    []
  );

  return (
    <TextField //
      value={text}
      onChange={event => setText(event.target.value)}
      label="Search"
      autoComplete="off"
      fullWidth
      size="small"
      InputProps={text ? { endAdornment: ClearButton } : undefined}
    />
  );
};

export default Search;
