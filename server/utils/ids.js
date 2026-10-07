let counter = 1000;

// TODO: MongoDB will generate ObjectIds; remove this helper then.
function createId(prefix) {
  counter += 1;
  return `${prefix}${counter}`;
}

module.exports = { createId };
