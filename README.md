enb-define
======

[![NPM version](https://img.shields.io/npm/v/enb-define.svg?style=flat)](https://www.npmjs.org/package/enb-define)
[![Build Status](https://img.shields.io/travis/enb-make/enb-define/master.svg?style=flat&label=tests)](https://travis-ci.org/enb-make/enb-define)
[![Coverage Status](https://img.shields.io/coveralls/enb-make/enb-define.svg?style=flat)](https://coveralls.io/r/enb-make/enb-define?branch=master)
[![Dependency Status](https://img.shields.io/david/enb-make/enb-define.svg?style=flat)](https://david-dm.org/enb-make/enb-define)

Пакет предоставляет [ENB](https://ru.bem.info/tools/bem/enb-bem/)-технологию для сборки, заменяющую плейсхолдеры вида `%%%SOME_VARIABLE_NAME%%%` на переданное значение.

## Установка

Установите пакет `enb-define`:

```sh
$ npm install --save-dev enb-define
```

**Требования:** зависимость от пакета `enb` версии `0.16.0` или выше.

Быстрый старт
-------------

```js
module.exports = function(config) {
    config.nodes('*.bundles/*', function(nodeConfig) {
        nodeConfig.addTechs([
            [require('enb-define'), {
                target: '?.js',
                sources: ['?.pre.js'],
                variables: {
                    basePath: '/'
                },
                sourcemap: true
            }]
        ]);
    });
};
```

Лицензия
--------

© 2015 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
