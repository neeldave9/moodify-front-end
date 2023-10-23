import React from "react";

export default function Error({ name, type, description }) {
  return (
    <div>
      <h1>
        {name} Error: {type}
      </h1>
      <p>{description}</p>
    </div>
  );
}
