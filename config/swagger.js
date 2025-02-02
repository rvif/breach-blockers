const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Learning Platform API",
      version: "1.0.0",
      description: "Complete API documentation for the Learning Platform",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            msg: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["student", "admin", "super"] },
            isEmailVerified: { type: "boolean" },
          },
        },
        Course: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            difficulty: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
            },
            category: { type: "string" },
          },
        },
        SearchResponse: {
          type: "object",
          properties: {
            results: { type: "array" },
            pagination: {
              type: "object",
              properties: {
                total: { type: "number" },
                page: { type: "number" },
                pages: { type: "number" },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management" },
      { name: "Courses", description: "Course operations" },
      { name: "Search", description: "Search functionality" },
      { name: "Profile", description: "Profile management" },
      { name: "Notifications", description: "Notification system" },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
