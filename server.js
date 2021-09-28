const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

//route files
const bootcamps = require('./routes/bootcamps');

// load the env config file
dotenv.config({ path: './config/config.env' });

const app = express();

// Dev logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`)
);
