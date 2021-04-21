
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from "firebase-functions";
const { CloudTasksClient } = require('@google-cloud/tasks');

import axios from 'axios';
import webpush from 'web-push';

import { DateTime, Interval, nextDate } from './date_helpers.js';
import { councilPathFor, regionPathFor } from './helpers.js';
import { humaniseCollectionTypes } from './constants.js';


// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
// {
//   credential: admin.credential.applicationDefault(),
// });

async function collator(context) {
  const regions = {};
  const councils = {};

  async function getRegion({councilId, regionId}) {
    const path = regionPathFor({councilId, regionId});
    if (!regions[path]) {
      const doc = await admin.firestore().doc(path).get();
      regions[path] = doc.data();
    }
    return regions[path];
  }

  async function getCouncil({councilId}) {
    const path = councilPathFor({councilId});
    if (!councils[path]) {
      const doc = await admin.firestore().doc(path).get();
      councils[path] = doc.data();
    }
    return councils[path];
  }

  const start = DateTime.local().startOf('hour').plus({hours: 1}).setZone('Australia/Melbourne');

  const window = Interval.fromDateTimes(start, start.plus({hours: 1}));

  console.log(window.start.toString(), ' - ', window.end.toString());

  const root = admin.firestore();
  const reminders = await root.collection('reminders').get();
  reminders.docs.forEach(async function(doc) {
    const reminderId = doc.id;
    const reminder = doc.data();
    const { userId } = reminder;
    const region = await getRegion(reminder);
    const council = await getCouncil(reminder);
    const next = nextDate({...reminder, ...region});

    console.log('comparing', next.toString());

    if (!window.contains(next)) {
      return;
    }

    const message = `${council.name} (${region.name})
${humaniseCollectionTypes(reminder.collectionTypes)} collection, starting
${nextDate({...region, day: reminder.day}).toRelative()}`;

    const payload = { reminderId, userId, message };

    const duplicates = await root.collection('notifications')
      .where('userId', '==', userId)
      .where('reminderId', '==', reminderId)
      .where('scheduledDate', '==', next.toJSDate())
      .get();

    if (duplicates.size > 0) {
      const doc = duplicates.docs[0];
      const data = doc.data();
      console.log('updating', data);
      await doc.ref.update({updated: data.updated+1});
      return;
    } else {
      await root.collection('notifications').add({
        ...payload,
        scheduledDate: next.toJSDate(),
        createdDate: new Date(),
        updated: 0,
      });
    }

    const client = new CloudTasksClient();

    const project = 'bin-night-767d0';
    const queue = 'notifierQueue';
    const location = 'us-central1';
    const url = 'https://us-central1-bin-night-767d0.cloudfunctions.net/notifier';

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

    const task = {
      httpRequest: {
        httpMethod: 'POST',
        headers: { 'Content-Type': 'application/json' },
        url,
      },
    };

    console.log('sending payload', payload);

    task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString('base64');
    // task.scheduleTime = {
    //   seconds: next.toMillis() / 1000
    // };
    task.scheduleTime = {
      seconds: (Date.now() / 1000) + 30
    };

    console.log('Sending task:');
    // console.log(task);
    // Send create task request.
    const request = {parent, task, timeout: 10};
    try {
      const [response] = await client.createTask(request);
      const name = response.name;
      console.log(`Created task ${name}`);
    } catch (error) {
      console.log('create task failed', error)
    }

  });

  return;
}

async function notify(body) {
  const { reminderId, userId, message } = body;

  if (!reminderId || !userId) return;

  console.log('sending reminder', reminderId, userId);

  const doc = await admin.firestore().collection('users').doc(userId).get();
  const user = doc.data();
  const { subscription } = user;
  if (!subscription) return;

  const subscriptionData = JSON.parse(subscription);

  console.log('sending', message, subscriptionData.subscription);

  const publicKey = "BKcgB9sSF6wqdcbcj-WXvFd78xpeJFWoiHW0MXAYOQzHAgrCTYLMj1DNw63oXL-5ZUwFcedex0Kh6VkOfDN4CnE";
  const privateKey = "y5qkE4wJ6vc66L7tZl4QyLQTwW2vPzeBueWk2Q8jXas";

  webpush.setVapidDetails(
    'mailto:simonhildebrandt@gmail.com',
    publicKey,
    privateKey
  );

  webpush.sendNotification(subscriptionData.subscription, message)
  .then(res => console.log('send response', res))
  .catch((err) => {
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('Subscription has expired or is no longer valid: ', err);
      // return deleteSubscriptionFromDatabase(subscription._id);
    } else {
      throw err;
    }
  });
}

// exports.scheduledFunction = functions.pubsub.schedule('every 1 minute').onRun(collator);
exports.collator = functions.https.onRequest((req, res) => {
  return collator()
    .then(() => res.end())
});

exports.notifier = functions.https.onRequest((req, res) => {
  return notify(req.body)
    .then(() => res.end())
});
