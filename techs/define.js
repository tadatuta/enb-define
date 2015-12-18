var enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    File = require('enb-source-map/lib/file');

module.exports = buildFlow.create()
    .name('define')
    .target('target', '?.js')
    .defineRequiredOption('target')
    .defineRequiredOption('source')
    .defineOption('variables', {})
    .defineOption('sourcemap', false)
    .useSourceText('source')
    .builder(function (source) {
        var sourcemap = this._sourcemap,
            fileName = this._source,
            target = this._target,
            variables = this._variables,
            replacedSource = replacePlaceholder(source, variables);

        return sourcemap ?
            renderWithSourceMaps(fileName, replacedSource, target) :
            replacedSource;
    })
    .createTech();

function replacePlaceholder(source, variables) {
    return source.replace(/%%%(.*?)%%%/g, function (match, varName) {
        if (typeof variables[varName] === 'undefined') {
            throw new Error('enb-define: There is no value for ' + varName + ' placeholder');
        }

        return variables[varName];
    });
}

function renderWithSourceMaps(fileName, content, target) {
    var targetFile = new File(target, { sourceMap: true, comment: 'block' });

    targetFile.writeFileContent(fileName, content);
    return targetFile.render();
}
