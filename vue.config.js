// vue.config.js

module.exports = {
    configureWebpack: {
        
        module: {
            rules: [{
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