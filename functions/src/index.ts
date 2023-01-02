
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// Start writing Firebase Functions
// https://github.com/firebase/functions-samples/issues/499
// https://haha.world/firebase-cors/

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';

const cors = require("cors")({
  origin: true
});

const APP_BUCKET = 'sullivan-f9153.appspot.com';
const APP_EMAIL = 'Sullivan Excavating Inc <sullivanexcavatinginc@gmail.com>';
const APP_CC = 'Sullivan Excavating Inc <sulli99181@outlook.com>';
const APP_BCC = 'Norm Lorenz <normlorenz@gmail.com>';
const SPAM_EMAIL = 'Norm Lorenz<normlorenz@gmail.com>';
const SPAM_CC = 'Sullivan Excavating Inc <sullivanexcavatinginc@gmail.com>';
const SUBJECT_CUSTOMER = 'Thank You for Your Interest';
const SUBJECT_BUSINESS = 'ATTN: Web Site Message Received';
const SUBJECT_SPAM = 'ATTN: Spam Email Received';

export interface IEmailEnvelope {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  address: string;
}

// this line is required
admin.initializeApp();

const mailTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass
  }
});

export const Status = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    response.send({ available: true, status: 'The email function is alive and well!' });
  });
});

export const SendSpamEmail = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    const bucket = admin.storage().bucket(APP_BUCKET);
    const template = await bucket.file('emails/spam.html').download();

    const mailOptions = {
      from: APP_EMAIL,
      to: SPAM_EMAIL,
      cc: SPAM_CC,
      subject: SUBJECT_SPAM,
      html: handlebars.compile(template.toString())(request.body)
    };

    mailTransport.sendMail(mailOptions, (err) => {
      if (err) { return response.send({ success: false, error: err.toString() }); }
      return response.send({ success: true, error: '' });
    });
  });
});

export const SendCustomerEmail = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    const bucket = admin.storage().bucket(APP_BUCKET);
    const template = await bucket.file('emails/customer.html').download();

    const mailOptions = {
      from: APP_EMAIL,
      to: request.body.email,
      cc: '',
      subject: SUBJECT_CUSTOMER,
      html: handlebars.compile(template.toString())(request.body)
    };

    mailTransport.sendMail(mailOptions, (err) => {
      if (err) { return response.send({ success: false, error: err.toString() }); }
      return response.send({ success: true, error: '' });
    });
  });
});

export const SendBusinessEmail = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    const bucket = admin.storage().bucket(APP_BUCKET);
    const template = await bucket.file('emails/business.html').download();

    const mailOptions = {
      from: APP_EMAIL,
      to: APP_EMAIL,
      cc: APP_CC,
      bcc: APP_BCC,
      subject: SUBJECT_BUSINESS,
      html: handlebars.compile(template.toString())(request.body)
    };

    mailTransport.sendMail(mailOptions, (err) => {
      if (err) { return response.send({ success: false, error: err.toString() }); }
      return response.send({ success: true, error: '' });
    });
  });
});
