require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser').json({ extended: true });
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const uploadRoutes = require('./routes/upload.routes');

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

app.use('/api', uploadRoutes.router);

app.listen(process.env.PORT, () => {
  console.log('Express server listening on port ', process.env.PORT); // eslint-disable-line
});
