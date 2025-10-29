const webpack = require("@nativescript/webpack");

module.exports = (env) => {
	webpack.init(env);

    // 添加下面的配置来解决 Node 核心模块找不到的问题（如 stream、crypto）
    webpack.chainWebpack((config) => {
        config.resolve.set('fallback', {
            "stream": false,
            "crypto": false,
        });
    });

	// Learn how to customize:
	// https://docs.nativescript.org/webpack

	return webpack.resolveConfig();
};