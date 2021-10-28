const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geoCoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const { json } = require('express');

//@desc          Get all bootcamps
//@route         GET /api/v1/bootcamps
//@access        Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //making a copy of req.query
  const reqQuery = { ...req.query };

  //Array of field to exclude
  const removeFields = ['select', 'sort'];

  //Loop over removeFields & delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  //create a query string
  let queryStr = JSON.stringify(reqQuery);

  //create operation (gt, gte, lte etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //finding resource
  query = Bootcamp.find(JSON.parse(queryStr));

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //executing query
  const bootcamps = await query;
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

//@desc          Get all bootcamp
//@route         GET /api/v1/bootcamps/:id
//@access        Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with an id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc          Create New bootcamp
//@route         POST /api/v1/bootcamps
//@access        Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc          Update bootcamp
//@route         PUT /api/v1/bootcamps/:id
//@access        Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with an id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc          Delete bootcamp
//@route         DELETE /api/v1/bootcamps/:id
//@access        Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with an id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: {} });
});

//@desc          Get Bootcamps within a radius
//@route         GET /api/v1/bootcamps/radius/:zipcode/:distance/:unit
//@access        Private
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get latitude or longitude from the Geocoder
  const loc = await geoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  //Calc radius using radiams
  //Divide distance by the radius of Earth
  //Earth Radius = 3,963 miles // 6378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
