import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";

export default {
  input: "src/index.js",
  output: {
    format: "umd",
    file: "main.js",
    name: "clustering",
  },
  external: [
    "electron",
    /* All the following modules are included in Node JS*/
    "fs",
    "os",
    "crypto",
    "path",
    "http",
    "https",
    "stream",
    "net",
    "tls",
    "zlib",
    "events",
    "url",
    "util",
    "string_decoder",
  ],
  plugins: [resolve(), commonjs(), json()],
};
