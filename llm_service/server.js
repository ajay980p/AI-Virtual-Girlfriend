"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const config_1 = require("./src/config");
const port = config_1.config.port;
app_1.default.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`llm2_service listening on http://localhost:${port}`);
});
