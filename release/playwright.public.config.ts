import {defineConfig} from "@playwright/test";
export default defineConfig({testDir:"tests/deployment",workers:1,use:{baseURL:process.env.OUR_PUBLIC_PREVIEW_URL??"https://local-language-model.vercel.app"}});
