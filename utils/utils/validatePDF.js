module.exports = function validatePDF(file) {
  return file.mimetype === 'application/pdf' && file.size <= 30000;
};
