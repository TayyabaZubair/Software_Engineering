// importing server url
import SERVER_URL from "../utils/server";
import axios from "axios";
import {
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_DETAIL_REQUEST,
  PRODUCT_DETAIL_FAIL,
  PRODUCT_DETAIL_SUCCESS,
  PRODUCT_CREATE_REVIEW_REQUEST,
  PRODUCT_CREATE_REVIEW_FAIL,
  PRODUCT_CREATE_REVIEW_SUCCESS,
} from "../constants/productConstants";

export const listProducts = (keyword = "") => async (dispatch) => {
  const URL = SERVER_URL;

  try {
    dispatch({ type: PRODUCT_LIST_REQUEST });

    const { data } = await axios.get(URL + `/products?keyword=${keyword}`);
    console.log(data.count);
    const { count, products } = data;

    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: { products, count },
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

//product Detail

export const listProductDetails = (id) => async (dispatch) => {
  const URL = SERVER_URL;

  try {
    dispatch({ type: PRODUCT_DETAIL_REQUEST });

    const { data } = await axios.get(URL + `/products/${id}`);
    // console.log(data);
    // const { product, reviews } = data;
    // console.log(product);

    dispatch({
      type: PRODUCT_DETAIL_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAIL_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const createProductReview = (productId, review) => async (
  dispatch,
  getState
) => {
  const URL = SERVER_URL;

  try {
    dispatch({ type: PRODUCT_CREATE_REVIEW_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    let rev = JSON.parse(JSON.stringify(review));
    await axios.post(URL + `/products/${productId}/reviews`, rev, config);

    console.log(rev);
    dispatch({
      type: PRODUCT_CREATE_REVIEW_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_CREATE_REVIEW_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
