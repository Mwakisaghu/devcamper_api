const path = require('path');
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
  const removeFields = ['select', 'sort', 'page', 'limit'];

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
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

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

  //Paginatio
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //executing query
  const bootcamps = await query;

  //Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
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
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with an id of ${req.params.id}`,
        404
      )
    );
  }

  bootcamp.remove();

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

//@desc          Upload photo for bootcamp
//@route         PUT /api/v1/bootcamps/:id/photo
//@access        Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with an id of ${req.params.id}`,
        404
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file `, 400));
  }

  const file = req.files.file;

  //Make sure the image is a file
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file `, 400));
  }

  //Check file size
  if (!file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} `,
        400
      )
    );
  }

  //Create a custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      sucess: true,
      data: file.name,
    });
  });

  console.log(file.name);
});
