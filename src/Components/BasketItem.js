// src/components/BasketItem.jsx
import React, { useState } from 'react';
import { FiMinus, FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const BasketItem = ({ item, onUpdateQuantity, onRemove, onSwap, extras }) => {
  const [showSwap, setShowSwap] = useState(false);

  return (
    <div className="basket-item">
      <div className="item-info">
        <span className="item-emoji">{item.emoji}</span>
        <div className="item-details">
          <h4>{item.name}</h4>
          <span className="item-price">₦{item.price} each</span>
        </div>
      </div>

      <div className="item-controls">
        <div className="quantity-controls">
          <button 
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={item.quantity === 0}
          >
            <FiMinus />
          </button>
          <span className="quantity">{item.quantity}</span>
          <button 
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.id, 1)}
          >
            <FiPlus />
          </button>
        </div>

        <div className="item-total">
          ₦{(item.price * item.quantity).toLocaleString()}
        </div>

        <div className="item-actions">
          <button 
            className="action-btn swap-btn"
            onClick={() => setShowSwap(!showSwap)}
            title="Swap item"
          >
            <FiRefreshCw />
          </button>
          <button 
            className="action-btn remove-btn"
            onClick={() => onRemove(item.id)}
            title="Remove item"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Swap Options */}
      {showSwap && (
        <div className="swap-options">
          <p>Swap with:</p>
          <div className="swap-grid">
            {extras.map(extra => (
              <button
                key={extra.id}
                className="swap-option"
                onClick={() => {
                  onSwap(item, extra);
                  setShowSwap(false);
                }}
              >
                <span className="swap-emoji">{extra.emoji}</span>
                <span className="swap-name">{extra.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasketItem;