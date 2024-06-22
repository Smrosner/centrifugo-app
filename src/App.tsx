import React from "react";
import Orderbook from "./components/Orderbook";

const App: React.FC = () => (
  <div>
    <Orderbook
      apiUrl="wss://api.testnet.rabbitx.io/ws"
      jwtToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwIiwiZXhwIjo1MjYyNjUyMDEwfQ.x_245iYDEvTTbraw1gt4jmFRFfgMJb-GJ-hsU9HuDik"
      symbol="ETHUSD"
    />
  </div>
);

export default App;
