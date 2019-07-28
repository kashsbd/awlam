function formatNumber(num) {
  return num > 999 ? (num / 1000).toFixed(1) + 'k' : num
}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

export default formatNumber;

export { isEmpty, isBlank };