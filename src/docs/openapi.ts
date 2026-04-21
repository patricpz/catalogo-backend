export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "SaaS Catálogo API",
    version: "1.0.0",
    description: "Documentação mínima da API para o fluxo de lojas",
  },
  servers: [
    {
      url: "/",
      description: "Servidor local"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/stores": {
      post: {
        summary: "Criar loja",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  whatsappNumber: { type: "string" },
                  plan: { type: "string", enum: ["free", "basic", "pro"] }
                },
                required: ["name"]
              }
            }
          }
        },
        responses: {
          "201": { description: "Loja criada" },
          "400": { description: "Requisição inválida" },
          "401": { description: "Não autenticado" },
          "409": { description: "Loja já existe" }
        },
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/stores/me": {
      get: {
        summary: "Pegar loja do usuário autenticado",
        responses: {
          "200": { description: "Loja encontrada" },
          "401": { description: "Não autenticado" },
          "404": { description: "Loja não encontrada" }
        },
        security: [{ bearerAuth: [] }]
      }
    },

  }
};

export default openapiSpec;
