// This is the config file used to compile the module that will be published to NPM.
const path = require('path')
const { defineConfig } = require('vite')
import banner from 'vite-plugin-banner'
import dts from "vite-plugin-dts";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import pkg from './package.json'

// Now in UTC time. Format time as YYYY-MM-DDTHH:mm:ss.sssZ.
const now = new Date().toISOString()

module.exports = defineConfig({
    build: {
        lib: {
            entry: path.resolve(
                __dirname,
                'lib/sc-camera-module.ts'
            ),
            name: 'sc-camera-module',
            fileName: (format) =>
                `sc-camera-module.${format}.js`,
        },
        minify: false,
    },
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
        nodePolyfills({
            // To exclude specific polyfills, add them to this list.
            // exclude: [
            //   'fs', // Excludes the polyfill for `fs` and `node:fs`.
            // ],
            // Whether to polyfill specific globals.
            globals: {
              Buffer: true, // can also be 'build', 'dev', or false
              global: true,
              process: true,
            },
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
          }),
        banner(
            `/**\n * name: ${pkg.name}\n * version: v${pkg.version}\n * description: ${pkg.description}\n * author: ${pkg.author}\n * repository: ${pkg.repository.url}\n * build date: ${now} \n */`
        ),
    ],
})
