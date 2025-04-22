import CryptoJS from 'crypto-js';

/**
 * Generate a SHA-256 hash from a file
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - The SHA-256 hash of the file
 */
export const generateFileHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      try {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Trim a long string (like an Ethereum address) for display
 * @param {string} str - The string to trim
 * @param {number} startChars - Number of characters to show at the start
 * @param {number} endChars - Number of characters to show at the end
 * @returns {string} - The trimmed string
 */
export const trimString = (str, startChars = 6, endChars = 4) => {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
};