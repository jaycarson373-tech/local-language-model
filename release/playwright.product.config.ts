import {defineConfig} from "@playwright/test";
const port=process.env.LLM_TEST_PORT??"3190";
const baseURL=`http://127.0.0.1:${port}`;
export default defineConfig({
  testDir:"tests/product", workers:1,
  use:{baseURL},
  webServer:{command:"npm start",url:baseURL+"/api/status",timeout:30000,
    env:{PORT:port,PUBLIC_URL:baseURL,NODE_ENV:"test",DB_PATH:"./data/product-test.sqlite"}}
});
