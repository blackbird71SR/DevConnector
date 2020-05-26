import React, { Fragment } from "react";

const NotFound = (props) => {
  return (
    <Fragment>
      <h1 className="x-large text-primary">
        <i className="fas fa-exclamation-traingle"></i>Page not found
      </h1>
      <p className="large">Sorry, This page does not exist!</p>
    </Fragment>
  );
};

export default NotFound;
