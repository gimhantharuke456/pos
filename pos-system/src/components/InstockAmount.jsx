import React, { useEffect, useState } from "react";
import distributionService from "../services/distributionService";

const InstockAmount = ({ id }) => {
  const [inStockAmount, setInstockAmount] = useState(0);
  useEffect(() => {
    distributionService
      .getDistributionByItemId(id)
      .then((res) => {
        setInstockAmount(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);
  return <div>{inStockAmount?.inStockAmount ?? 0}</div>;
};

export default InstockAmount;
