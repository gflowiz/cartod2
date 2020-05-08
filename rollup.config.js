import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";

export default {
  input: "src/main.js",
  output: {
    format: "amd",
    file: "cartod2.js",
    name: "clustering",
    extend: true,
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
    "d3@5"
  ],
  plugins: [resolve(), commonjs(), json()],
};
