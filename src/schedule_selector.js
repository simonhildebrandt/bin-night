import React, { useContext } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import arrayToSentence from 'array-to-sentence';

import { CADENCE_DAYS, COLLECTION_TYPES, timeLabelByIncrement } from './constants';

import { navigate, NavigationContext } from './navigation';
import { db, useFirestoreCollection, useFirestoreDocument } from './firebase';

import ScheduleForm from './schedule_form';


export default function() {
  const navHash = useContext(NavigationContext);
  const { councilId, regionId } = navHash;
  const council = useFirestoreDocument(`councils/${councilId}`);
  const regions = useFirestoreCollection(`councils/${councilId}/regions`);
  const regionList = Object.entries(regions)
    .map(([id, region]) => ({...region, id}))
    .sort((a,b) => a.name.localeCompare(b.name))

  if (!council) return null;

  return <Box>
    <h2>{council.name}</h2>
    {regionList.map(region => (
      <Box key={region.id}>
        <h3>{region.name}</h3>
        { region.id === regionId ? <ScheduleForm/> : (
          <Box>
            Collection for { arrayToSentence(region.collectionTypes.map(c => COLLECTION_TYPES[c])) }
            , on { arrayToSentence(region.cadence.map(c => CADENCE_DAYS[c])) } starting { timeLabelByIncrement(region.startTime).string }
            <Button onClick={() => navigate(`/${councilId}/${region.id}`)}>Schedule a reminder</Button>
          </Box>
        ) }
      </Box>
    ))}
  </Box>
}
