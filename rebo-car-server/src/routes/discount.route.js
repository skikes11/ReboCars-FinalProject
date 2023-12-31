var express = require('express');
var router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

const discountController = require('../controllers/discount.controller');

router.get('/', discountController.getAllDiscount);

router.get('/search', discountController.findDiscountsFilterWithRegexString);

module.exports = router;
