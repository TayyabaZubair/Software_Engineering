import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  ListGroup,
  Button,
} from "react-bootstrap";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { listOrderMine } from '../actions/orderActions';

const OrderHistoryScreen = (props) => {
  const dispatch = useDispatch();
  const orderMineList = useSelector((state) => state.orderMineList);
  const { loading, error, orders} = orderMineList;

  useEffect(() => {
    dispatch(listOrderMine());
  }, [dispatch]);

  const detailsHandler = (id) => {
    props.history.push(`/order/${id}`);
  };

  return (
    <Row>
      <Col md={12}>
        <h1>Order History</h1>
        {loading ? (
            <Loader />
        ) : !loading && orders.orderHistory && orders.orderHistory.length === 0 ? (
          <Message>
            You have no previous orders.{"  "}
            <Link to="/">
              <bold>Go Shopping!</bold>
            </Link>
          </Message>
        ) : (
          <ListGroup variant="flush">
              <ListGroup.Item className={"orderHistHeading"} key={"heading"}>
              <Row>
                  <Col className={"orderHistoryHeading"} md={2}><strong>Order ID</strong></Col>
                  <Col className={"orderHistoryHeading"}md={3}>Total Price</Col>
                  <Col className={"orderHistoryHeading"}md={3}>Paid</Col>
                  <Col className={"orderHistoryHeading"}md={2}>Delivered</Col>
                  <Col className={"orderHistoryHeading"}md={2}>Actions</Col>
                </Row>
              </ListGroup.Item>
            {!loading && orders.orderHistory && orders.orderHistory.map((order) => (
              <ListGroup.Item className={"orderHistData"} key={order.order_id}>
                  {console.log(orders.orderHistory)}
                <Row>
                  <Col className={"orderHistoryData"} md={2}>{order.order_id}</Col>
                  <Col className={"orderHistoryData"} md={3}>PKR {order.totalPrice.toFixed(2)}</Col>
                  <Col className={"orderHistoryData"} md={3}>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</Col>
                  <Col className={"orderHistoryData"} md={2}>{order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'No'}</Col>
                  <Col className={"orderHistoryData"} md={2}>
                    <Button
                      type="button"
                      onClick={() => detailsHandler(order.order_id)}
                    >Details
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
    </Row>
  );
};

export default OrderHistoryScreen;
