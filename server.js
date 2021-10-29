const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const morgan = require('morgan');
const connectDB = require('./config/db');

// load the env config file
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

//Body Parser
app.use(express.json());

// Dev logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on ${PORT}`.yellow.bold
  )
);

//Handle unhandled promise rejections
process.on('unhandledRejections', (err, promise) => {
  console.log(`Error:${err.message}`.red);
  //Close Server and Exit the Process
  server.close(() => process.exit(1));
});
