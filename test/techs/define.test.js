require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-string'))
    .should();

var mock = require('mock-fs'),
    FileList = require('enb/lib/file-list'),
    MockNode = require('mock-enb/lib/mock-node'),
    loadDirSync = require('mock-enb/utils/dir-utils').loadDirSync,
    defineTech = require('../../techs/define');

describe('define', function () {
    afterEach(function () {
        mock.restore();
    });

    it('must replace placeholders', function () {
        var bundle = { 'bundle.pre.js': "console.log('%%%blah%%%');" },
            reference = "console.log('hello');";

        return build(bundle, {
            source: '?.pre.js',
            target: 'js',
            variables: {
                blah: 'hello'
            }
        }).spread(function (content) {
            content.should.be.equal(reference);
        });
    });

    it('must throw for undeclared placeholders', function () {
        var bundle = { 'bundle.pre.js': "console.log('%%%blah%%%');" };

        return build(bundle, {
            source: '?.pre.js',
            target: 'js'
        }).should.be.rejectedWith('enb-define: There is no value for blah placeholder');
    });

    it('must support custom placeholders', function () {
        var bundle = { 'bundle.pre.js': "console.log('___blah$$$');" },
            reference = "console.log('hello');";

        return build(bundle, {
            source: '?.pre.js',
            target: 'js',
            placeholder: { before: '___', after: '$$$' },
            variables: {
                blah: 'hello'
            }
        }).spread(function (content) {
            content.should.be.equal(reference);
        });
    });

    it('must generate sourcemap', function () {
        var bundle = { 'bundle.pre.js': "console.log('%%%blah%%%');" };

        return build(bundle, {
            source: '?.pre.js',
            target: 'js',
            variables: {
                blah: 'hello'
            },
            sourcemap: true
        }).spread(function (content) {
            content.should.match(/sourceMappingURL/);
        });
    });
});

function build(bundleDir, options, isNeedRequire) {
    mock({
        blocks: {},
        bundle: bundleDir
    });

    var bundle = new MockNode('bundle'),
        fileList = new FileList(),
        testFunc;

    fileList.addFiles(loadDirSync('blocks'));

    bundle.provideTechData('?.files', fileList);

    testFunc = isNeedRequire ? bundle.runTechAndRequire : bundle.runTechAndGetContent;

    return testFunc.call(bundle, defineTech, options);
}
