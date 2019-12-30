const SHA256 = require("crypto-js/sha256"); // Crypto hash generator
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const token = uid2(64);
console.log(token);
