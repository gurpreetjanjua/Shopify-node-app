var express = require('express');
var router = express.Router();

const dotenv = require('dotenv').config();
const cookie = require('cookie');
const nonce = require('nonce')();
const request = require('request-promise');

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index');
});

router.post('/app-install', function (req, res, next) {
    const shop = req.body.shopname.concat('.myshopify.com');
    const scopes = req.body.permissions.toString();
    if (shop) {
        const state = nonce();
        const redirectUri = 'http://localhost:3000/shopify/callback';
        const installUrl = 'https://' + shop +
            '/admin/oauth/authorize?client_id=' + apiKey +
            '&scope=' + scopes +
            '&state=' + state +
            '&redirect_uri=' + redirectUri;

        res.cookie('state', state);
        res.redirect(installUrl);
    } else {
        return res.status(400).send('Wrong Store');
    }
});

router.get('/shopify', (req, res) => {
    res.redirect('/user/orders');
});

router.get('/shopify/callback', (req, res) => {
    const { shop, hmac, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state;
  
    if (state !== stateCookie) {
      return res.status(403).send('Request origin cannot be verified');
    }
  
    if (shop && hmac && code) {
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code,
        };

        request.post(accessTokenRequestUrl, {
                json: accessTokenPayload
            }).then((accessTokenResponse) => {
                const accessToken = {
                    'shopname': shop,
                    'accessToken': accessTokenResponse.access_token
                };
                res.cookie('accessToken',JSON.stringify(accessToken));
                res.redirect('//' + shop + '/admin/apps/nodeapp-8');
            }).catch((error) => {
                res.status(error.statusCode).send(error.error.error_description);
            });
    } else {
        res.status(400).send('Required parameters missing');
    }
});

module.exports = router;