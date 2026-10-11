export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Solita Agent Test API",
    version: "1.0.0",
    description: "REST API that sends a prompt to an agent and returns a message.",
  },
  paths: {
    "/prompt": {
      post: {
        summary: "Send a prompt",
        description: "Accepts a prompt and returns the agent response as a message.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    example: "What is a good cocktail bar in Stockholm?",
                  },
                },
                required: ["prompt"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Agent response returned successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Try Tjoget on Hornsgatan.",
                    },
                  },
                  required: ["message"],
                },
              },
            },
          },
          "400": {
            description: "The request body is missing a prompt.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "prompt is required",
                    },
                  },
                  required: ["message"],
                },
              },
            },
          },
        },
      },
    },
  },
};
