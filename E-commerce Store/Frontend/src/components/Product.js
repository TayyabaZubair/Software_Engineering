import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "../components/Rating";

const Product = ({ product }) => {
  return (
    <>
      <Card className="my-3 p-3 rounded">
        <Link to={`/product/${product.id}`}>
          <Card.Img src={product.image} variant="top" />
        </Link>
        <Card.Body>
          <Link to={`/product/${product.id}`}>
            <Card.Title as="h5" className="text-center">
              <strong>{product.name}</strong>
            </Card.Title>
          </Link>
          <Card.Text as="div">
            <Rating
              value={product.rating}
              text={`${product.numReviews} reviews`}
            />
            {product.short_desc}
          </Card.Text>
          <Card.Text>
            <div className="h5">$ {product.price}</div>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};
export default Product;
