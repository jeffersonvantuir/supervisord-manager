import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withLess = require('next-with-less');

module.exports = withLess({
    lessLoaderOptions: {
        modifyVars: {
            '@primary-color': '#1890ff', // Altere conforme necessário
            '@link-color': '#1DA57A',
            '@font-size-base': '16px',
        },
        javascriptEnabled: true,
    },
});

export default nextConfig;
