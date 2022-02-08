const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const pool = require("../config/helpers");

// @desc FETCH ALL PRODUCTS
// @route GET /api/products
// @access Public
router.get("/", (req, res) => {
  // let keyword = req.query.keyword
  //   ? {
  //       title: {
  //         $regex: req.query.keyword,
  //         $options: "i",
  //       },
  //     }
  //   : {};
    // console.log(keyword);
  let page =
    req.query.page !== undefined && req.query.page !== 0 ? req.query.page : 1; // set the current page number
  const limit =
    req.query.limit !== undefined && req.query.limit !== 0
      ? req.query.limit
      : 12; // set the limit of items per page

  let startValue;
  let endValue;

  if (page > 0) {
    startValue = page * limit - limit;
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = 12;
  }

  let productListQuery =
    "SELECT c.title as category, p.title as name, \
                              p.price, p.quantity, p.image, p.id, p.short_desc, \
                              p.rating, p.numReviews \
                              from products p, categories c \
                              WHERE p.cat_id = c.id  \
                              order by p.id limit 12;";

  pool.query(productListQuery, (error, results, fields) => {
    if (!error) {
      res.status(200).json({
        count: results.length,
        products: results,
      });
    } else {
      res.json({
        message: "No products found",
      });
    }
  });
});

// @desc FETCH SINGLE PRODUCT
// @route GET /api/products/:prod_id
// @access Public
router.get("/:prod_id", (req, res) => {
  // let productid = req.params.prod_id;
  let productQuery = "SELECT * from products where products.id=?";
  let reviewsQuery = "SELECT * from reviews where reviews.product_id =?";
  let product = {};
  let reviews = [];

  pool.query(productQuery, [req.params.prod_id], (error, results, fields) => {
    if (!error) {
      product = results[0];
      if (product) {
        pool.query(
          reviewsQuery,
          [req.params.prod_id],
          (error, results, fields) => {
            if (!error) {
              reviews = results;
              res.status(200).json({
                product: product,
                reviews: reviews,
              });
            } else {
              res.json({
                message: `No product found with ProductId ${productId}`,
              });
            }
          }
        );
      }
    } else {
      console.log(error);
    }
  });
});

// @desc CREATE new review
// @route POST /api/products/:prod_id/reviews
// @access Private
router.post("/:prod_id/reviews", protect, (req, res) => {
  const { rating, comment } = req.body;

  let productQuery = "SELECT * from products where products.id=?";
  let alreadyReviewedQuery = `SELECT * from reviews where reviews.user_id =? and reviews.product_id=?`;
  let insertReviewQuery = `INSERT INTO REVIEWS SET ?`;

  let reviewed;

  // pool.query(productQuery, [req.params.prod_id], (error, results, fields) => {
  //   let product;
  //   if (!error) {
  //     product = results[0];
  //     // console.log(product);
  //   } else {
  //     console.log(error);
  //   }
  // });

  pool.query(
    alreadyReviewedQuery,
    [req.id, req.params.prod_id],
    (error, results1, fields) => {
      if (!error) {
        reviewed = results1[0];
        let newReview = {
          rating: Number(rating),
          product_id: req.params.prod_id,
          review: comment,
          user_id: req.id,
        };
        if (!reviewed) {
          pool.query(insertReviewQuery, newReview, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.status(201).json({
                message: "New Review Added",
              });
            }
          });
        } else {
          res.status(400).json({
            message: "Product already reviewed",
          });
        }
      }
    }
  );
});

// db.end();
module.exports = router;
