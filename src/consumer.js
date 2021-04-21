import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import arrayToSentence from 'array-to-sentence';

import Delete from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';

import CouncilSearch from './council_search'
import { db, useFirestoreCollection, useFirestoreDocuments, FirebaseContext } from './firebase';
import { councilPathFor, regionPathFor } from './helpers';
import { nextDate, timeAgo } from './date_helpers';
import { navigate } from './navigation';
import { DATE_FORMAT_OPTIONS } from './constants';


const urlFor = ({councilId, regionId}) => `/${councilId}/${regionId}`;


function Reminders() {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(new Date().valueOf());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const [user] = useContext(FirebaseContext);
  const reminders = useFirestoreCollection(`reminders`, ['userId', '==', user.uid]);

  const regionPaths = Object.values(reminders)
    .map(({councilId, regionId}) => regionPathFor({councilId, regionId}))

  const uniqueRegionPaths = [...new Set(regionPaths)]

  const regions = useFirestoreDocuments(uniqueRegionPaths);

  const councilPaths = Object.values(reminders)
    .map(({councilId}) => councilPathFor({councilId}))

  const uniqueCouncilPaths = [...new Set(councilPaths)]

  const councils = useFirestoreDocuments(uniqueCouncilPaths);
  const scheduleTimes = [];
  Object.entries(reminders).forEach(([id, reminder]) => {
    const region = regions[regionPathFor(reminder)];
    const council = councils[councilPathFor(reminder)];
    if (!region || !council) return;
    scheduleTimes.push({
      id, reminder, region, council,
      next: nextDate({...reminder, ...region})
    });
  })

  function deleteReminder(id) {
    db.doc(`reminders/${id}`).delete();
  }

  return <ul>
    { scheduleTimes.map(({id, reminder, council, region, next}) => (
      <li key={id}>
        <Box color="info.main">
          {timeAgo.format(next.toJSDate())}
        </Box>
        <Box onClick={() => navigate(`/${urlFor(reminder)}`)}>{council.name} - {region.name}</Box>
        {arrayToSentence(reminder.collectionTypes)}
        <Box>
          next reminder: {next.toLocaleString(DATE_FORMAT_OPTIONS)}
        </Box>
        <IconButton onClick={() => deleteReminder(id)}><Delete/></IconButton>
      </li>
    ))}
  </ul>
}


export default function() {
  const [user] = useContext(FirebaseContext);

  return <>
    <h1>Bin Night</h1>
    <p></p>
    <h2>Reminders</h2>
    { user && <Reminders/> }
    <h2>Create a reminder</h2>
    <CouncilSearch/>
  </>
}
