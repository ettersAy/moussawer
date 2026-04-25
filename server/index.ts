import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Moussawer API running on http://localhost:${config.port}`);
  console.log(`API docs available at http://localhost:${config.port}/api-docs`);
});
