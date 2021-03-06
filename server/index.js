require('dotenv/config');
const express = require('express');

const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');

const app = express();

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

// Check Connection
app.get('/api/health-check', (req, res, next) => {
  db.query('select \'successfully connected\' as "message"')
    .then(result => res.json(result.rows[0]))
    .catch(err => next(err));
});

// GET cart
app.get('/api/cart', (req, res, next) => {
  if (!req.session.cartId) {
    res.json([]);
    return;
  }

  const sql = `
    SELECT  "c"."cartItemId", "c"."price",
            "p"."productId", "p"."name",
            "p"."image", "p"."shortDescription"
    FROM    "cartItems" AS "c"
    JOIN    "products" AS "p" USING ("productId")
    WHERE   "c"."cartId" = $1`;
  const values = [req.session.cartId];

  db.query(sql, values)
    .then(result => res.json(result.rows));
});

// POST to the cart
app.post('/api/cart', (req, res, next) => {
  if (!req.body) {
    next(new ClientError('request body required', 400));
  }

  if (isNaN(req.body.productId) || req.body.productId < 1) {
    next(new ClientError('productId must be a positive integer', 400));
  }
  const sqlSelectPrice = `
    SELECT  "price"
    FROM    "products"
    WHERE   "productId" = $1`;
  const values = [req.body.productId];

  db.query(sqlSelectPrice, values)
    .then(result => {
      if (!result.rows) {
        next(new ClientError('Product not found', 404));
      }
      const { price } = result.rows[0];
      const item = { price };

      if (!req.session.cartId) {
        const sqlInsertRows = `
          INSERT INTO "carts" ("cartId", "createdAt")
          VALUES  (default, default) 
          RETURNING "cartId"`;

        return db.query(sqlInsertRows)
          .then(response => {
            const { cartId } = response.rows[0];
            item.cartId = cartId;
            return item;
          });
      }
      item.cartId = req.session.cartId;
      return item;
    })
    .then(itemObj => {
      const { cartId, price } = itemObj;
      req.session.cartId = cartId;

      const sqlInsertItem = `
        INSERT INTO "cartItems" ("cartId", "productId", "price")
        VALUES    ($1, $2, $3)
        RETURNING "cartItemId"`;
      const values = [cartId, req.body.productId, price];

      return db.query(sqlInsertItem, values)
        .then(result => result.rows[0]);
    })
    .then(cartItem => {
      const { cartItemId } = cartItem;

      const sqlGetProductInfo = `
        SELECT  "c"."cartItemId", "c"."price",
                "p"."productId", "p"."name",
                "p"."image", "p"."shortDescription"
        FROM    "cartItems" AS "c"
        JOIN    "products" AS "p" USING ("productId")
        WHERE   "c"."cartItemId" = $1`;
      const values = [cartItemId];

      db.query(sqlGetProductInfo, values)
        .then(result => res.status(201).json(result.rows[0]));
    })
    .catch(err => next(err));
});

// DELETE from cart
app.delete('/api/cart/:productId/all', (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    next(new ClientError('Must provide a valid product id', 400));
  }

  const sqlDeleteItem = `
    DELETE FROM "cartItems"
    WHERE       "productId" = $1
    RETURNING *`;
  const values = [productId];

  db.query(sqlDeleteItem, values)
    .then(result => res.sendStatus(204))
    .catch(err => next(err));
});

// DELETE single item from cart
app.delete('/api/cart/:cartItemId', (req, res, next) => {
  const { cartItemId } = req.params;

  if (!cartItemId) {
    res.status(400).json({ error: 'Must provide a valid cart item id ' });
  }

  const sqlDeleteItem = `
    DELETE FROM "cartItems"
    WHERE       "cartItemId" = $1
    RETURNING *`;
  const values = [cartItemId];

  db.query(sqlDeleteItem, values)
    .then(result => res.sendStatus(204))
    .catch(err => next(err));
});

// Place an order
app.post('/api/orders', (req, res, next) => {
  if (!req.session.cartId) {
    next(new ClientError('Missing cart', 400));
  }
  if (!req.body) {
    next(new ClientError('No body present in REQUEST', 400));
  }
  const custInfo = req.body;
  if (!custInfo.name || !custInfo.creditCard || !custInfo.shippingAddress) {
    next(new ClientError('"name", "address" and "creditCard" are required fields for placing orders'));
  }

  const sqlInsertOrder = `
    INSERT INTO "orders" ("cartId", "name", "creditCard", "shippingAddress")
    VALUES ($1, $2, $3, $4)
    RETURNING "orderId", "name", "creditCard", "shippingAddress", "createdAt"`;
  const values = [req.session.cartId, custInfo.name, custInfo.creditCard, custInfo.shippingAddress];

  db.query(sqlInsertOrder, values)
    .then(result => {
      delete req.session.cartId;
      res.status(201).json(result.rows[0]);
    })
    .catch(err => next(err));
});

// GET all products
app.get('/api/products', (req, res, next) => {
  const sql = `
    SELECT  "productId", "name", "price",
            "image", "shortDescription"
    FROM    "products"`;
  db.query(sql)
    .then(response => res.json(response.rows))
    .catch(err => next(err));
});

// GET product details by ID
app.get('/api/products/:productId', (req, res, next) => {
  let { productId } = req.params;
  productId = parseInt(productId);

  if (isNaN(productId) || productId < 1) {
    res.status(400).json({ error: 'Id must be a positive integer.', requestedId: productId });
    return;
  }

  const sql = `
    SELECT  *
    FROM    "products"
    WHERE   "productId" = $1`;
  const values = [productId];

  db.query(sql, values)
    .then(response => {
      const product = response.rows[0];
      if (!product) {
        next(new ClientError('Id does not exit', 404));
      }
      res.json(response.rows[0]);
    })
    .catch(error => next(error));
});

app.use('/api', (req, res, next) => {
  next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', process.env.PORT);
});
