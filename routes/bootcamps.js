const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ sucess: true, data: { msg: 'Show all bootcamps' } });
});

router.get('/:id', (req, res) => {
  res.status(200).json({
    sucess: true,
    data: { msg: `Show bootcamp ${req.params.id}` },
  });
});

router.post('/', (req, res) => {
  res.status(200).json({ sucess: true, data: { msg: 'Create new bootcamp' } });
});

router.put('/:id', (req, res) => {
  res.status(200).json({
    sucess: true,
    data: { msg: `Update bootcamps ${req.params.id}` },
  });
});

router.delete('/:id', (req, res) => {
  res.status(200).json({
    sucess: true,
    data: { msg: `Delete bootcamps ${req.params.id}` },
  });
});

module.exports = router;
