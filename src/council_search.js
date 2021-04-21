import React, { useContext, useState, useRef } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import TextField from '@material-ui/core/TextField';
import Popper from '@material-ui/core/Popper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/styles';

import { useFirestoreCollection } from './firebase';
import { navigate, NavigationContext } from './navigation';
import ScheduleSelector from './schedule_selector';


const styles = makeStyles({
  searchMenu: {
    backgroundColor: 'white'
  }
})

export default function() {
  const classes = styles();

  const navHash = useContext(NavigationContext);
  const { councilId } = navHash;

  const searchFieldRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  function updateSearchText (event) {
    setSearchText(event.target.value)
  }

  const [searchListOpen, setSearchListOpen] = useState(false);
  const handleSearchFieldFocused = () => {
    setSearchListOpen(true);
  }
  const handleSearchClickAway = () => {
    setSearchListOpen(false);
  }

  const councils = useFirestoreCollection('councils');
  const filteredSearchResults = Object.entries(councils)
    .map(([id, council]) => ({id, name: council.name}))
    .filter(r => r.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name))
    .slice(0, 5)

  return <>
    <ClickAwayListener onClickAway={handleSearchClickAway}>
      <Box>
      <TextField
        inputRef={searchFieldRef}
        placeholder="council name"
        onFocus={handleSearchFieldFocused}
        onChange={updateSearchText}
        value={searchText}
      />
      { searchFieldRef.current &&
        <Popper open={searchListOpen} anchorEl={searchFieldRef.current} placement="bottom">
          <Box className={classes.searchMenu}>
            {filteredSearchResults.length === 0 ? 'none?' :
              filteredSearchResults.map(({id, name}) =>
                <MenuItem key={id} onClick={() => navigate(`/${id}`)}>{name}</MenuItem>
              )
             }
          </Box>
        </Popper>
      }
      </Box>
    </ClickAwayListener>
    { councilId && <ScheduleSelector councilId={councilId} /> }
  </>
}
