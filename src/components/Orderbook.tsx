import React, { useState, useEffect } from "react";
import { Centrifuge } from "centrifuge";
import "../Orderbook.css";

interface Order {
  price: number;
  size: number;
}

interface OrderbookProps {
  apiUrl: string;
  jwtToken: string;
  symbol: string;
}

const Orderbook: React.FC<OrderbookProps> = ({ apiUrl, jwtToken, symbol }) => {
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  // const centrifugeRef = useRef<Centrifuge | null>(null);
  // const sequenceRef = useRef<number | null>(null);

  useEffect(() => {
    const centrifuge = new Centrifuge("wss://api.testnet.rabbitx.io/ws", {
      token: jwtToken,
    });

    centrifuge.on("connected", () => {
      console.log("Connected to WebSocket");
      const sub = centrifuge.newSubscription(`orderbook_${symbol}`);

      sub.on("publication", (ctx) => {
        console.log("Publication received", ctx);
        const data = ctx.data;
        if (data) {
          console.log("data", data);
          updateOrderbook(data.bids, data.asks);
        } else {
          console.log("no data received in publication");
          updateOrderbook([], []);
        }
      });

      sub.on("error", (error) => {
        console.error("Subscription error:", error);
      });

      sub.on("subscribed", async () => {
        console.log(`Successfully subscribed to orderbook_${symbol}`);

        try {
          const history = await sub.history({ limit: 100 });
          console.log("History received", history.publications);
          // Process history data similarly to how publications are processed
          history.publications.forEach((pub) => {
            updateOrderbook(pub.data.bids, pub.data.asks);
          });
        } catch (err) {
          console.error("Failed to fetch history:", err);
        }
      });

      sub.subscribe();
    });

    centrifuge.connect();
  }, [apiUrl, jwtToken, symbol]);

  const updateOrderbook = (newBids: Order[], newAsks: Order[]) => {
    console.log("newBids", newBids);
    console.log("newAsks", newAsks);
    if (newBids.length === 0 && newAsks.length === 0) {
      newBids = [
        { price: 100, size: 10 },
        { price: 101, size: 11 },
      ]; // Example dummy bids
      newAsks = [
        { price: 102, size: 12 },
        { price: 103, size: 13 },
      ]; // Example dummy asks
      console.log("Using dummy data for bids and asks");
    }

    setBids((prevBids) => mergeOrders(prevBids, newBids));
    setAsks((prevAsks) => mergeOrders(prevAsks, newAsks));
  };

  const mergeOrders = (currentOrders: Order[], newOrders: Order[]): Order[] => {
    const orderMap = new Map<number, Order>();

    // Add current orders to the map
    currentOrders.forEach((order) => {
      orderMap.set(order.price, order);
    });

    // Update or add new orders
    newOrders.forEach((order) => {
      const existingOrder = orderMap.get(order.price);
      if (existingOrder) {
        existingOrder.size += order.size; // Update size if price exists
      } else {
        orderMap.set(order.price, order); // Add new order if price does not exist
      }
    });

    // Convert map back to array and sort
    const merged = Array.from(orderMap.values());
    merged.sort((a, b) => b.price - a.price); // Sort descending for bids, change to a.price - b.price for asks if needed
    return merged.slice(0, 10); // Limit to top 10 orders
  };
  console.log("bids", bids);
  console.log("asks", asks);
  return (
    <div className="orderbook">
      <div className="bids">
        <h3>Bids</h3>
        <ul>
          {bids.map((order, index) => (
            <li key={index}>
              <span className="price">{order.price}</span>
              <span className="size">{order.size}</span>
              <span className="total">
                {(order.price * order.size).toFixed(4)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="asks">
        <h3>Asks</h3>
        <ul>
          {asks.map((order, index) => (
            <li key={index}>
              <span className="price">{order.price}</span>
              <span className="size">{order.size}</span>
              <span className="total">
                {(order.price * order.size).toFixed(4)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Orderbook;
