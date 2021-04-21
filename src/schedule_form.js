import React, { useContext, useState, useEffect } from 'react';

import juration from 'juration';
import arrayToSentence from 'array-to-sentence';
import { DateTime } from 'luxon';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/styles';

import { navigate, NavigationContext } from './navigation';
import { db, useFirestoreCollection, useFirestoreDocument, FirebaseContext } from './firebase';

import { timeLabelByIncrement, CADENCE_DAYS, COLLECTION_TYPES, DATE_FORMAT_OPTIONS } from './constants';

import { nextDate } from './date_helpers';


const styles = makeStyles({
  sentence: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    "& > div": {
      marginRight: 8,
      height: 50
    }
  },
  label: {
    lineHeight: 2
  }
})

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function() {
  const classes = styles();

  const [user] = useContext(FirebaseContext);

  const navHash = useContext(NavigationContext);
  const { councilId, regionId } = navHash;
  const region = useFirestoreDocument(`councils/${councilId}/regions/${regionId}`);

  const [offsetString, setOffsetString] = useState('1 hour');
  const updateOffsetString = e => setOffsetString(e.target.value);

  let offset;
  try {
    offset = juration.parse(offsetString)
  } catch (e) {
  }

  const [direction, setDirection] = useState('before');
  const updateDirection = e => setDirection(e.target.value);

  const [collectionTypes, setCollectionTypes] = useState([]);
  const updateCollectionTypes = e => setCollectionTypes(e.target.value);

  const [day, setDay] = useState('');
  const updateDay = e => setDay(e.target.value);

  useEffect(() => {
    if (!region) return;
    setCollectionTypes([region.collectionTypes[0]]);
    setDay(region.cadence[0]);
  }, [region]);

  const [showSnack, setShowSnack] = useState(false);

  if (!region) return null;

  const handleSnackClose = () => {
    setShowSnack(false);
  }

  const createReminder = () => {
    db.collection('reminders').add({
      userId: user.uid,
      createdDate: new Date(),
      councilId,
      regionId,
      day,
      offsetString,
      offset,
      direction,
      collectionTypes,
    });
    setShowSnack(true);
  }

  const next = offset && nextDate({
    startDate: region.startDate,
    startTime: region.startTime,
    day, direction, offset
  })

  return <Box>
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={showSnack}
      autoHideDuration={60000}
      onClose={handleSnackClose}
    >
      <Alert severity="success" action={
        <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }>Reminder created!</Alert>
    </Snackbar>

    <Box className={classes.sentence}>
      <Box className={classes.label}>Notify me</Box>
      <Box>
        <TextField error={offset === undefined} value={offsetString} onChange={updateOffsetString}/>
      </Box>
      <Box>
        <Select value={direction} onChange={updateDirection}>
          <MenuItem value="before">before</MenuItem>
          <MenuItem value="after">after</MenuItem>
        </Select>
      </Box>
      <Box className={classes.label}>the</Box>
      <Box>
        <Select value={day} onChange={updateDay}>
          { region.cadence.map(day =>
            <MenuItem key={day} value={day}>{CADENCE_DAYS[day]}</MenuItem>
          )}
        </Select>
      </Box>
      <Box className={classes.label}>{timeLabelByIncrement(region.startTime).string}</Box>
      <Box>
        <Select
          multiple={true}
          value={collectionTypes}
          onChange={updateCollectionTypes}
          renderValue={values => arrayToSentence(values.map(type => COLLECTION_TYPES[type]))}
        >
          { region.collectionTypes.map(type =>
            <MenuItem key={type} value={type}>{COLLECTION_TYPES[type]}</MenuItem>
          )}
        </Select>
      </Box>
      <Box className={classes.label}>collection starts</Box>
      <Box className={classes.label}>
        {user ? (
          <Button
            variant="contained"
            color="primary"
            disabled={offset === undefined}
            onClick={createReminder}
          >Schedule</Button>
        ) : (
          "Login to schedule a reminder"
        ) }
      </Box>
    </Box>
    { offset === undefined ? (
      <Box color="error.main">
        We're not sure about '{ offsetString }' - please try something like '1 hour' or '90 minutes'
      </Box>) : (
      <Box color="info.main">
        First scheduled notification would be: <Box component="span" fontWeight="bold">{
          next.toLocaleString(DATE_FORMAT_OPTIONS)
        }</Box>.
      </Box>
      )
    }
  </Box>
}
