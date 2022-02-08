const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const pool = require("../config/helpers");

//mine orders by userid
router.get("/mine", protect, (req, res) =>{
  let getOrderListQuery = `Select order_id, totalPrice, isPaid, paidAt from orders, payment where orders.user_id = '${req.id}' and payment.order_id = orders.id`;
  pool.query(getOrderListQuery, (err, result1) => {
    if (err) {
      res.status(404).json({message: "No orders found!"})
      console.log(err);
    } else {
      res.status(201).json({orderHistory: result1})
    }
  });
});

// @desc   Create new Order
// @route  POST /api/orders
// @access Private
router.post("/", protect, (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  console.log(req.body);

  const { address, city, postalCode, country } = shippingAddress;

  const userData = {
    user_id: req.id,
  };

  let paymentDetailsQuery = `SELECT P.paymentMethod, P.itemsPrice, P.taxPrice, \
  P.isPaid, P.isDelivered, P.paidAt, P.deliveredAt, \
  P.shippingPrice, P.totalPrice from Payment P \
  WHERE P.order_id = ?`;
  let insertOrderQuery = `INSERT INTO ORDERS SET ?`;
  let paymentQuery = "INSERT INTO PAYMENT SET ?";
  let shippingQuery = "INSERT INTO SHIPPING SET ?";
  let orderDetailsQuery = "INSERT INTO ORDERS_DETAILS SET ?";

  if (orderItems && orderItems.length == 0) {
    res.status(400).json({
      message: "No order Items",
    });
  } else {
    pool.query(insertOrderQuery, userData, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const paymentFields = {
          paymentMethod,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          order_id: result.insertId,
        };
        pool.query(paymentQuery, paymentFields, (err, result1) => {
          if (err) {
            console.log(err);
          } else {
            // console.log(result1);
          }
        });

        const shippingFields = {
          address,
          city,
          postalCode,
          country,
          order_id: result.insertId,
        };
        pool.query(shippingQuery, shippingFields, (err, result2) => {
          if (err) {
            console.log(err);
          } else {
            // console.log(result2);
          }
        });

        orderItems.forEach(async (order) => {
          pool.query(
            orderDetailsQuery,
            {
              product_id: order.product,
              order_id: result.insertId,
              quantity: order.qty,
            },
            (err, result3) => {
              if (err) {
                console.log(err);
              } else {
                // console.log(result3);
              }
            }
          );
        });

        let getPaymentDetail = {};
        pool.query(
          paymentDetailsQuery,
          [result.insertId],
          (err, updatePaymentFields) => {
            if (err) {
              console.log(err);
            } else {
              getPaymentDetail = updatePaymentFields[0];
            }
          }
        );
        const createdOrder = {
          orderItems: orderItems,
          shippingAddress: shippingFields,
          payment: getPaymentDetail,
        };
        console.log(createdOrder);
        res.status(201).json({
          order_id: result.insertId,
          createdOrder,
        });
      }
    });
  }
});

// @desc   Get an order by ID
// @route  GET /api/orders/:id
// @access Private

router.get("/:id", protect, (req, res) => {
  const orderId = req.params.id;
  console.log(orderId);

  let userDetailQuery =
    "SELECT U.fname, U.lname, U.email\
                       from USERS U, ORDERS O \
                       WHERE O.id=? AND\
                       O.user_id = U.id";

  let orderItemsQuery =
    "Select P.id, P.title, P.image,\
                          P.price, OD.quantity FROM \
                          ORDERS_DETAILS OD, PRODUCTS P\
                          WHERE OD.order_id = ? AND\
                          OD.product_id = P.id \
                          order by P.id;";

  let shippingDetailsQuery =
    "SELECT S.address, S.city, S.postalCode, \
                               S.country FROM \
                                SHIPPING S\
                                where S.order_id = ?";

  let paymentDetailsQuery =
    "SELECT P.paymentMethod, P.itemsPrice, P.taxPrice, \
              P.isPaid, P.isDelivered, P.paidAt, P.deliveredAt, \
               P.shippingPrice, P.totalPrice from Payment P \
              WHERE P.order_id = ?";

  let orderItems = [];
  let shippingAddress = {};
  let user = {};
  let paymentDetails = {};

  pool.query(orderItemsQuery, [orderId], (error, results, fields) => {
    if (error) {
      res.status(404).json({
        message: "No OrderItems Found",
      });
      console.log(error);
    } else {
      orderItems = results;
      // res.json(results);
    }
  });

  pool.query(shippingDetailsQuery, [orderId], (error, results) => {
    if (error) {
      res.status(404).json({
        message: "No ShippingDetails Found",
      });
    } else {
      shippingAddress = results[0];
    }
  });

  pool.query(userDetailQuery, [orderId], (error, results) => {
    if (error) {
      res.status(404).json({
        message: "No user Details Found",
      });
    } else {
      user = results[0];
    }
  });

  pool.query(paymentDetailsQuery, [orderId], (error, results) => {
    if (error) {
      res.status(404).json({
        message: "No order Details Found",
      });
    } else {
      paymentDetails = results[0];
      res.status(201).json({
        id: orderId,
        orderItems: orderItems,
        shippingAddress,
        user: user,
        paymentDetails,
      });
    }
  });
});

// @desc   Update order to paid
// @route  PUT /api/orders/:id
// @access Private

router.put("/:id/pay", protect, (req, res) => {
  const orderId = req.params.id;
  const date = new Date(req.body.update_time).toJSON().slice(0, 10);

  let paymentResult = {
    id: req.body.id.toString(),
    status: req.body.status.replace(/\s+/g, "").trim(),
    update_time: date,
    email_address: req.body.payer.email_address.replace(/\s+/g, "").trim(),
  };

  console.log(paymentResult);

  let updatePaymentQuery = `UPDATE payment SET isPaid=${true}, paidAt='${date}' WHERE order_id=?`;
  let updatePaymentresultQuery = `UPDATE payment_result SET paypal_id='${paymentResult.id}', status='${paymentResult.status}',
                                  update_time='${paymentResult.update_time}', email_address='${paymentResult.email_address}' 
                                  WHERE order_id=?`;

  pool.query(updatePaymentQuery, [orderId], (err, payment) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        message: "No Order Found",
      });
    } else {
      console.log(payment);
    }
  });

  pool.query(updatePaymentresultQuery, [req.params.id], (err, paymentResult) => {
    if (err) {
      console.log(err);
    } else {
      console.log(paymentResult);
    }
  }
  );

  // Getting updated Data from Database
  // let getUpdatedDataQuery = `SELECT P.isPaid, P.paidAt, PR.status,\
  //                             PR.update_time, PR.email_address\
  //                             FROM Payment P, Payment_result PR\
  //                             WHERE P.order_id=? AND\
  //                             Pr.order_id=? AND\
  //                             P.id = PR.payment_id`;

  let getUpdatedDataQuery = `SELECT P.isPaid, P.paidAt, PR.status,
  PR.update_time, PR.email_address from Payment P,
  payment_result PR WHERE P.order_id=? AND Pr.order_id=? AND P.id = PR.payment_id`;

  console.log("hello orderRoute");
  pool.query(getUpdatedDataQuery, [orderId,orderId,orderId], (err, updateResults, fields) => {
    if (err) {
      res.status(400).json({
        message: "No Payment Details with corresponding order Id Found",
      });
      console.log(err);
    } else {
      res.status(201).json(updateResults[0]);
    }
  });
});

// db.end();
module.exports = router;
