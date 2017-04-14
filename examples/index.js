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
    total: 7,
    page: 3
});

new Pagination({
    el: '#range-1',
    mode: 'range',
    total: 3,
    page: 3
});

new Pagination({
    el: '#range-2',
    mode: 'range',
    total: 7,
    page: 3
});

new Pagination({
    el: '#range-3',
    mode: 'range',
    total: 9,
    page: 3
});

new Pagination({
    el: '#range-4',
    mode: 'range',
    total: 15,
    page: 3
});


