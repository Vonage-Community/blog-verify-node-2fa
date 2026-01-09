require('dotenv').config();

const express = require('express');
const app = express();
const nunjucks = require('nunjucks');

const VONAGE_APPLICATION_ID = process.env.VONAGE_APPLICATION_ID;
const VONAGE_APPLICATION_PRIVATE_KEY_PATH = process.env.VONAGE_APPLICATION_PRIVATE_KEY_PATH;
const VERIFY_BRAND_NAME = process.env.VERIFY_BRAND_NAME;

const { Vonage } = require('@vonage/server-sdk');
const { Channels } = require('@vonage/verify2');

const vonage = new Vonage({
  applicationId: VONAGE_APPLICATION_ID,
  privateKey: VONAGE_APPLICATION_PRIVATE_KEY_PATH,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
nunjucks.configure('views', { express: app });

app.get('/', (req, res) => {
  res.render('index.html', { message: 'Hello, world!' })
});

app.post('/verify', async (req, res) => {
  try {
    const { requestId } = await vonage.verify2.newRequest({
      brand: VERIFY_BRAND_NAME,
      workflow: [
        {
          channel: Channels.SMS,
          to: req.body.number,
        },
      ],
    });
    
    res.render('check.html', { requestId: requestId });
  } catch (err) {
    console.error(err);
    res.render('index.html', { message: err });
  }
});

app.post('/check', async (req, res) => {
  try {
    const status = await vonage.verify2.checkCode(req.body.requestId, req.body.code);
    console.log(`The status is ${status}`);
    res.render('success.html');
  } catch (err) {
    console.error(err);
    res.render('index.html', { message: err });
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000')
});
