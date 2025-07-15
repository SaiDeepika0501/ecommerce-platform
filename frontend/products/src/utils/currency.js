/**
 * Currency utility functions for Indian Rupee (INR) formatting
 */

/**
 * Format amount in Indian Rupees with proper comma separation
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted INR amount
 */
export const formatINR = (amount, showDecimals = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }

  const numAmount = parseFloat(amount);
  
  if (showDecimals) {
    return `₹${numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else {
    return `₹${Math.round(numAmount).toLocaleString('en-IN')}`;
  }
};

/**
 * Format amount with Indian currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with ₹ symbol
 */
export const formatCurrency = (amount) => {
  return formatINR(amount);
}; 