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
 * Convert USD to INR (approximate conversion rate)
 * @param {number} usdAmount - Amount in USD
 * @param {number} rate - Exchange rate (default: 83)
 * @returns {number} Amount in INR
 */
export const convertUSDToINR = (usdAmount, rate = 83) => {
  return parseFloat(usdAmount) * rate;
};

/**
 * Format amount with Indian currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with ₹ symbol
 */
export const formatCurrency = (amount) => {
  return formatINR(amount);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string like "₹1,234.56"
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  return parseFloat(currencyString.replace(/[₹,]/g, ''));
}; 