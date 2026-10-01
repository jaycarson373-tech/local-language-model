import {defineConfig} from "@playwright/test";
export default defineConfig({testDir:"tests/mobile-navigation",use:{baseURL:"http://127.0.0.1:3000"},webServer:{command:"npm start",url:"http://127.0.0.1:3000/api/status",timeout:30000,env:{PUBLIC_URL:"http://127.0.0.1:3000",NODE_ENV:"test",DB_PATH:"./data/mobile-verified.sqlite"}}});
