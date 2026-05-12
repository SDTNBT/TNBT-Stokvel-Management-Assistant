const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    primeRate: 10.25,
    repoRate: 6.75,
    source: 'South African Reserve Bank Current Market Rates',
    sourceUrl: 'https://www.resbank.co.za/en/home/what-we-do/statistics/key-statistics/current-market-rates',
    lastUpdated: '2026-05-08'
  });
});

module.exports = router;