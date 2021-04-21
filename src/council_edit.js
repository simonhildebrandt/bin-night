import React, { useContext }  from 'react';

import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Add from '@material-ui/icons/Add';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { db, useFirestoreCollection } from './firebase';
import { navigate, NavigationContext } from './navigation';
import { TIMES_15_MINUTE_INCREMENTS, CADENCE_DAYS, COLLECTION_TYPES } from './constants';


function secondsFromDate(date) {
  return date ? new Date(date.seconds * 1000).toISOString().split('T')[0] : '';
}

export default function() {
  const navHash = useContext(NavigationContext);
  const { councilId, regionId } = navHash;

  const regions = useFirestoreCollection(`councils/${councilId}/regions`);

  function addRegion(councilId){
    db.collection("councils").doc(councilId).collection('regions').add({
      name: '[new region]',
      startDate: new Date(),
      cadence: ['MO'],
      startTime: 0,
      collectionTypes: ['rubbish']
    });
  }

  function updateRegion(councilId, regionId, attrs) {
    db.collection("councils").doc(councilId).collection('regions').doc(regionId).update(attrs);
  }

  function updateRegionStartDate(councilId, regionId, e) {
    const { value } = e.target;
    updateRegion(councilId, regionId, { startDate: value ? new Date(value) : null })
  }

  function updateRegionStartTime(councilId, regionId, e) {
    const { value: startTime } = e.target;
    updateRegion(councilId, regionId, { startTime })
  }

  function updateRegionCollectionTypes(councilId, regionId, e) {
    const { value: collectionTypes } = e.target;
    updateRegion(councilId, regionId, { collectionTypes })
  }

  function updateRegionCadence(councilId, regionId, e) {
    const { value: cadence } = e.target;
    updateRegion(councilId, regionId, { cadence })
  }

  return <Box>
    <h5>Regions <IconButton onClick={() => addRegion(councilId)}><Add/></IconButton></h5>
    <Box>
      { regions && Object.entries(regions).map(([regionId, region]) => (
        <Box key={regionId}>
          <TextField
            value={region.name}
            onChange={e => updateRegion(councilId, regionId, { name: e.target.value })}
          />
          <TextField
            value={secondsFromDate(region.startDate)}
            type="date"
            onChange={e => updateRegionStartDate(councilId, regionId, e)}
          />
          <Select
            value={region.startTime || 0}
            onChange={e => updateRegionStartTime(councilId, regionId, e)}
          >
            {TIMES_15_MINUTE_INCREMENTS.map(({i, string}) =>
              <MenuItem key={i} value={i}>{string}</MenuItem>
            )}
          </Select>
          <Select
            multiple={true}
            value={region.collectionTypes || []}
            onChange={e => updateRegionCollectionTypes(councilId, regionId, e)}>
            {Object.keys(COLLECTION_TYPES).map(type =>
              <MenuItem key={type} value={type}>{COLLECTION_TYPES[type]}</MenuItem>
            )}
          </Select>
          <Select
            multiple={true}
            value={region.cadence || []}
            onChange={e => updateRegionCadence(councilId, regionId, e)}
          >
            { Object.entries(CADENCE_DAYS).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </Box>
      ) ) }
    </Box>
  </Box>
}
