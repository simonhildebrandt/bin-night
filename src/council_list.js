import React, { useContext, useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import Add from '@material-ui/icons/Add';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import TextField from '@material-ui/core/TextField';

import { DateTime } from 'luxon';

import { db, useFirestoreCollection } from './firebase';
import { navigate, NavigationContext } from './navigation';

import CouncilEdit from './council_edit';


const styles = makeStyles({
  editingPanel: {
  }
})

export default () => {
  const classes = styles();

  const councils = useFirestoreCollection('councils');

  const [newCouncilName, setNewCouncilName] = useState('');
  const updateNewCouncilName = event => setNewCouncilName(event.target.value);

  const createCouncil = () => {
    db.collection("councils").add({ name: '[no name]' })
  }

  const navHash = useContext(NavigationContext);
  const { councilId, regionId } = navHash;

  function toggleCouncil(id) {
    if (id === councilId) {
      navigate('edit');
    } else {
      selectCouncil(id);
    }
  }

  function selectCouncil(councilId) {
    navigate(`edit/${councilId}`)
  }

  const updateCouncilName = (id, name) => {
    db.collection("councils").doc(id).update({name});
  }

  return <div className={classes.editingPanel}>
    <h2>Edit Council Data</h2>
    <h3>Councils <IconButton onClick={createCouncil}><Add/></IconButton></h3>
    { Object.entries(councils).map( ([id, council]) => (
      <Box key={id}>
        <h4>
          <IconButton onClick={() => toggleCouncil(id)}>
            { id === councilId ? <ArrowDropUp /> : <ArrowDropDown /> }
          </IconButton>
          <TextField value={council.name} onChange={e => updateCouncilName(id, e.target.value)} />
        </h4>
        { id === councilId && <CouncilEdit/> }
      </Box>
    ))}

  </div>
}
