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
    .defineOption('placeholder', '%%%')
    .useSourceText('source')
    .builder(function (source) {
        var logger = this.node.getLogger(),
            warn = function (msg) {
                logger.warn(msg, 'define');
            },
            sourcemap = this._sourcemap,
            fileName = this._source,
            target = this._target,
            variables = this._variables,
            placeholder = typeof this._placeholder === 'string' ?
                { before: this._placeholder, after: this._placeholder } :
                this._placeholder,
            placeholderRegExp = new RegExp(regExpEscape(placeholder.before) + '(.*?)' +
                regExpEscape(placeholder.after), 'g'),
            replacedSource = replacePlaceholder(source, variables, placeholderRegExp, warn);

        return sourcemap ?
            renderWithSourceMaps(fileName, replacedSource, target) :
            replacedSource;
    })
    .createTech();

// https://github.com/benjamingr/RegExp.escape/blob/master/polyfill.js
function regExpEscape(s) {
    return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

function replacePlaceholder(source, variables, placeholderRegExp, warn) {
    return source.replace(placeholderRegExp, function (match, varName) {
        if (typeof variables[varName] === 'undefined') {
            warn('There is no value for ' + varName + ' placeholder');
            return; // Should we return here something?
        }

        return variables[varName];
    });
}

function renderWithSourceMaps(fileName, content, target) {
    var targetFile = new File(target, { sourceMap: true, comment: 'block' });

    targetFile.writeFileContent(fileName, content);
    return targetFile.render();
}
