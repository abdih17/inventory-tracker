'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('inventory:server');

const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT;
const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);


app.use(cors());
app.use(morgan('dev'));
app.use(errors);

app.listen(PORT, () => {
  debug('server up:', PORT);
});
