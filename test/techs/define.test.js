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
            sources: ['?.pre.js'],
            target: 'js',
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
            sources: ['?.pre.js'],
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
