var vow = require('vow'),
    enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    File = require('enb-source-map/lib/file');

module.exports = buildFlow.create()
    .name('define')
    .target('target', '?.js')
    .defineRequiredOption('target')
    .defineRequiredOption('sources')
    .defineOption('variables', {})
    .defineOption('divider', '\n')
    .defineOption('sourcemap', false)
    .useSourceListFilenames('sources')
    .builder(function (sources) {
        var divider = this._divider,
            sourcemap = this._sourcemap,
            target = this._target,
            variables = this._variables;

        return vow.all(sources.map(function (sourceFilename) {
            return vfs.read(sourceFilename, 'utf8');
        })).then(function (sourcesContent) {
            if (!sourcemap) {
                return sourcesContent
                    .map(function (sourceContent) {
                        return replacePlaceholder(sourceContent, variables);
                    })
                    .join(divider);
            }

            return joinWithSourceMaps(sources, sourcesContent, divider, target, variables);
        });
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

function joinWithSourceMaps(fileNames, contents, divider, target, variables) {
    var targetFile = new File(target, { sourceMap: true, comment: 'block' });

    fileNames.forEach(function (file, i) {
        targetFile.writeFileContent(file, replacePlaceholder(contents[i], variables));
        targetFile.write(divider);
    });

    return targetFile.render();
}
