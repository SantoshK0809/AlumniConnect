let IS_PROD = true;

const server = IS_PROD
  ? "https://alumniconnect-1lfc.onrender.com"
  : "http://localhost:4000";

export default server;