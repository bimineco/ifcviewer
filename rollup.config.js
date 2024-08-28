import resolve from '@rollup/plugin-node-resolve';

export default{
    //input: 'index.js', //Error en carga de la libreria de DXF
    input: './modules/model-viewer.js',
    output: [
        {
            format: 'esm',
            file: 'bundle.js'
        }
    ],
    plugins:[
        resolve()
    ]
};