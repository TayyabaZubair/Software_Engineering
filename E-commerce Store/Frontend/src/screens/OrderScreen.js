import React, { useEffect, useState } from "react";
import URL from "../utils/server";
import axios from "axios";
import { PayPalButton } from "react-paypal-button-v2";
import { Row, Col, Card, ListGroup, Image } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getOrderDetails, payOrder } from "../actions/orderActions";
import { ORDER_PAY_RESET } from "../constants/orderConstants";

const OrderScreen = ({ match }) => {
  const orderId = match.params.id;
  const [sdkReady, setSdkReady] = useState(false);
  const dispatch = useDispatch();
  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, error: errorPay, success: successPay } = orderPay;

  useEffect(() => {
    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get(URL + "/config/paypal");
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    //   if (!order || (!loadingPay && successPay)) {
    //     dispatch({ type: ORDER_PAY_RESET });
    //     dispatch(getOrderDetails(orderId));
    //   } else if (!order.paymentDetails.isPaid) {
    //     if (!window.paypal) {
    //       addPayPalScript();
    //     } else {
    //       setSdkReady(true);
    //     }
    //   }
    // }, [dispatch, orderId, successPay, order, loadingPay]);

    if (!order || successPay || (order && order.id !== orderId)) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch(getOrderDetails(orderId));
    } else {
      if (!order.paymentDetails.isPaid) {
        if (!window.paypal) {
          addPayPalScript();
        } else {
          setSdkReady(true);
        }
      }
    }
  }, [dispatch, order, orderId, sdkReady, successPay]);

  const successPaymentHandler = (paymentResult) => {
    console.log(paymentResult);
    console.log(orderId);
    dispatch(payOrder(orderId, paymentResult));
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
            <>
              <h1>Order {order.id}</h1>
              <Row>
                <Col md={8}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <h2>Shipping</h2>
                      <p>
                        <strong>Name: </strong> {order.user.fname}{" "}
                        {order.user.lname}
                      </p>
                      <p>
                        <strong>Email: </strong>
                        <a href={`mailto:${order.user.email}`}>
                          {order.user.email}
                        </a>
                      </p>
                      <p>
                        <strong>Address:</strong>
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city}{" "}
                        {order.shippingAddress.postalCode}{" "}
                        {order.shippingAddress.country}
                      </p>
                      {/* {order.paymentDetails.isDelivered ? (
                        <Message variant="success">
                          Delivered on {new Date().toDateString()}
                        </Message>
                      ) : (
                          <Message variant="danger">Not Delivered</Message>
                        )} */}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <h2>Payment Method</h2>
                      <p>
                        <strong>Method:</strong>
                        {order.paymentDetails.paymentMethod}
                      </p>

                      {order.paymentDetails.isPaid ? (
                        <Message variant="success">Paid on {order.paymentDetails.paidAt.slice(0, 10)}</Message>
                      ) : (
                          <Message variant="danger">Not Paid</Message>
                        )}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <h2>Order Items</h2>
                      {/* {order.orderItems.length === 0 ? (
                        <Message>Order is Empty</Message>
                      ) : ( */}
                      <ListGroup variant="flush">
                        {order.orderItems.map((item, index) => (
                          <ListGroup.Item key={index}>
                            <Row>
                              <Col md={1}>
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fluid
                                  rounded
                                />
                              </Col>
                              <Col>
                                <Link to={`/product/${item.id}`}>
                                  {item.title}
                                </Link>
                              </Col>
                              <Col md={4}>
                                {item.quantity} x RS{item.price} = RS{" "}
                                {(item.quantity * item.price).toFixed(2)}
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      {/* )} */}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={4}>
                  <Card>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <h2>Order Summary</h2>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Row>
                          <Col>Items</Col>
                          <Col>PKR {order.paymentDetails.itemsPrice}</Col>
                        </Row>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Row>
                          <Col>Shipping</Col>
                          <Col>PKR {order.paymentDetails.shippingPrice}</Col>
                        </Row>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Row>
                          <Col>Tax</Col>
                          <Col>PKR {order.paymentDetails.taxPrice}</Col>
                        </Row>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Row>
                          <Col>Total</Col>
                          <Col>PKR {order.paymentDetails.totalPrice}</Col>
                        </Row>
                      </ListGroup.Item>
                      {/* {!order.paymentDetails.isPaid && (
                        <ListGroup.Item>
                          {loadingPay && <Loader />}
                          {!sdkReady ? (
                            <Loader />
                          ) : (
                              <PayPalButton
                                amount={order.paymentDetails.totalPrice}
                                onSuccess={successPaymentHandler}
                              />
                            )}
                        </ListGroup.Item>
                      )} */}
                      {!order.paymentDetails.isPaid && (
                        <ListGroup.Item>
                          {!sdkReady ? (
                            <Loader />
                          ) : (
                              <>
                                {loadingPay && <Loader />}
                                {errorPay && (
                                  <Message variant="danger">{errorPay}</Message>
                                )}
                                <PayPalButton
                                  amount={order.paymentDetails.totalPrice}
                                  onSuccess={successPaymentHandler}
                                />
                              </>
                            )}
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card>
                </Col>
              </Row>
            </>
          )}
    </>
  );
};

export default OrderScreen;
