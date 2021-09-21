// vue.config.js

module.exports = {
    configureWebpack: {

        module: {
            rules: [{
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }, {
                test: /\.(glb)(\?.*)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {}
                }]
            },
            ]
        }
    }
}