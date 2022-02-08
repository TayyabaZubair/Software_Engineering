import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "../components/Rating";

import { useDispatch, useSelector } from "react-redux";
import {
  listProductDetails,
  createProductReview,
} from "../actions/productActions";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { PRODUCT_CREATE_REVIEW_RESET } from "../constants/productConstants";

const ProductScreen = ({ history, match }) => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product, reviews } = productDetails;
  console.log(reviews);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const {
    success: successproductReview,
    error: errorProductReview,
  } = productReviewCreate;

  console.log(errorProductReview);

  useEffect(() => {
    if (successproductReview) {
      alert("Review Submitted!");
      setRating(0);
      setComment("");
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }
    dispatch(listProductDetails(match.params.id));
  }, [dispatch, match, successproductReview]);

  const addToCartHandler = () => {
    history.push(`/cart/${match.params.id}?qty=${qty}`);
  };
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProductReview(match.params.id, {
        rating,
        comment,
      })
    );
  };

  return (
    <>
      <Link className="btn btn-light my-2" to="/">
        {"<"} Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row>
            <Col md={6}>
              <Image
                // style={{ borderRadius: "20%" }}
                src={product.image}
                alt={product.name}
                fluid
                className="mb-5"
              />
            </Col>
            <Col md={6}>
              <Card>
                <ListGroup.Item>
                  <h2 className="text-center">Product Details</h2>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h3 className="text-center" style={{ color: "orangered" }}>
                    {product.title}
                  </h3>
                  {/* need to add rating */}
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                  <br />
                  {/* {product.quantity > 0 ? "In Stock" : "Out of Stock"} */}
                </ListGroup.Item>
                <ListGroup.Item>
                {product.quantity > 0 ?
                  <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                    Stock: {product.quantity}
                  </p> : <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                    Out of Stock
                  </p>}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Description:{" "}
                  </strong>
                  {product.description}
                  <br />
                </ListGroup.Item>
                <ListGroup.Item>
                  <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                    Price: $ {product.price}
                  </p>
                </ListGroup.Item>
                {product.quantity > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <h4>Qty</h4>
                      </Col>
                      <Col>
                        <Form.Control
                          as="select"
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                        >
                          {[...Array(product.quantity).keys()].map((x) => (
                            <option key={x + 1}>{x + 1}</option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                <Button
                  onClick={addToCartHandler}
                  variant="dark"
                  size="lg"
                  block
                  disabled={product.quantity === 0}
                >
                  <h4 style={{ color: "white" }}>
                    <i className="fas fa-shopping-cart"></i> Add to Cart
                  </h4>
                </Button>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <h2>Reviews</h2>
              {loading === false && reviews.length === 0 && (
                <Message>No Reviews</Message>
              )}
              <ListGroup variant="flush">
                {loading === false &&
                  reviews.map((rev) => (
                    <ListGroup.Item key={rev.id}>
                      <Rating value={rev.rating} />
                      {/* {userInfo.fname + " " + userInfo.lname}
                      <br /> */}
                      <p>{rev.review}</p>
                    </ListGroup.Item>
                  ))}
                <ListGroup.Item>
                  <h2>Write a Customer Review</h2>
                  {errorProductReview && (
                    <Message variant="danger">{errorProductReview}</Message>
                  )}
                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group controlId="rating">
                        <Form.Label>Rating</Form.Label>
                        <Form.Control
                          as="select"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very good</option>
                          <option value="5">5 - Excellent</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group controlId="comment">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          row="3"
                          onChange={(e) => setComment(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                      <Button type="submit" variant="primary">
                        Submit
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      Please <Link to="/login">Sign In</Link> to write a review
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;
