const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

// load the env config file
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');

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
