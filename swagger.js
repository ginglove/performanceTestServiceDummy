const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

// Swagger Configuration
const PORT = process.env.PORT || 3000;
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Performance Test API",
      version: "1.0.0",
      description: "API for performance testing with different loads",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };