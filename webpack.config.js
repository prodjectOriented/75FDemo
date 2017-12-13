var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var paths = require('./config/paths');

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src/client');
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist/client/build');

module.exports = {
    entry: path.resolve(APP_PATH, 'entry.js'),
    output: {
        path: BUILD_PATH,
        publicPath: '/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {include: /\.json$/, loaders: ['json-loader']},
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                loader: 'babel',
                query: require('./config/babel.dev')
            },
            {
                test: /\.s?css$/,
                loader: 'style!css!postcss!sass'
            },
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,  loader: 'url?limit=10000&minetype=application/font-woff' },
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff2' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,   loader: 'url?limit=10000&minetype=application/octet-stream' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,   loader: 'url?limit=10000&minetype=image/svg+xml' },
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
        ],
        noParse: /node_modules\/quill\/dist\/quill.js/
    },
    resolve: {
        root: ROOT_PATH
    },
    devtool: 'eval-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml
        })
    ],
    recordsPath: path.join(__dirname, 'webpack.compilation-records.json'),
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    // fs and child_process specifically for D3, see https://github.com/d3/d3/issues/3140 for details
    node: {
        fs: 'empty',
        child_process: 'empty'
    }
};