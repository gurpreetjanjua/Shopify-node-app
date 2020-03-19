var express = require('express');
var router = express.Router();
const Shopify = require('shopify-api-node');
const cookie = require('cookie');

/* GET users listing. */
router.get('/orders', (req, res) => {
  const accessToken = cookie.parse(req.headers.cookie).accessToken;
  const shopify = new Shopify(JSON.parse(accessToken));
  
  shopify.order.list({ limit: 5 })
  .then(orders => res.send(orders))
  .catch(err => console.error(err));
});

module.exports = router;
