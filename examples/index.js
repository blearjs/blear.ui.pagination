/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var Pagination = require('../src/index');

new Pagination({
    el: '#simple',
    mode: 'simple',
    total: 20,
    page: 3
}).on('change', function (page, calback) {
    calback({
        page: page
    });
});

new Pagination({
    el: '#range',
    mode: 'range',
    total: 20,
    page: 3
}).on('change', function (page, calback) {
    calback({
        page: page
    });
});


