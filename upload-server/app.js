require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser').json({ extended: true });
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// default options
app.use(fileUpload());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Headers', 'Accept');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  next();
});
app.use(cors());
app.use(helmet.frameguard());
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(
  helmet.hsts({
    maxAge: 6 * 30 * 24 * 60 * 60,
    includeSubDomains: true,
    force: true
  })
);

app.use(
  morgan((tokens, req, res) => {
    console.log(
      JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params,
        url: tokens.url(req, res)
      })
    );
    return [
      `<pid : ${process.pid}> <${process.env.NODE_ENV}>`,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms'
    ].join(' ');
  })
);

app.post('/api/upload', (req, res) => {
  console.log('Upload Called');
  if (req.header('Upload-Auth') !== process.env.SECRET_KEY.toString()) {
    console.log('Upload-Auth not correct');
    return res
      .status(400)
      .send({ success: false, message: 'Un Authorized Access' });
  }
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length == 0) {
    return res.status(400).send({
      success: false,
      message: 'No files were uploaded.'
    });
  }
  const uploaded = [];
  console.log('Authenticated and there are files');

  Object.keys(req.files).forEach(key => {
    const file = req.files[key];
    // Use the mv() method to place the file somewhere on your server
    file.mv(`./upload/${file.name}`, err => {
      if (err) {
        return res
          .status(500)
          .send({ success: false, message: err, files: null });
      }
      uploaded.push(file.name);
      console.log(uploaded);
      console.log(`File ${file.name} is uploaded successfully`);
    });
  });
  console.log('-------------');
  console.log(uploaded);
  return res.status(200).send({ success: true, message: 'Files Uploaded !' });
});

app.listen(process.env.PORT, () => {
  console.log('Express server listening on port ', process.env.PORT); // eslint-disable-line
});
