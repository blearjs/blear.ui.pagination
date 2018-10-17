/**
 * 文件描述
 * @author ydr.me
 * @create 2018-10-17 14:30
 * @update 2018-10-17 14:30
 */


'use strict';

var Template = require('blear.classes.template');
var object = require('blear.utils.object');

var defaults = {
    /**
     * 分页模式，有 simple/range 两种
     * @type String
     */
    mode: 'simple',

    /**
     * 分页可视范围
     * @type Number
     */
    range: 7,

    /**
     * 分页总数
     * @type Number
     */
    total: 1,

    /**
     * 当前页码
     * @type Number
     */
    page: 1,

    /**
     * 前一页文本
     * @type String
     */
    prev: '≪',

    /**
     * 后一页文本
     * @type String
     */
    next: '≫',

    /**
     * 省略页文本
     * @type String
     */
    ellipsis: '•••'
};
var parsers = {
    simple: require('./parsers/simple'),
    range: require('./parsers/range')
};
var tpls = {
    simple: new Template(require('./templates/simple.html')),
    range: new Template(require('./templates/range.html'))
};

/**
 * 分页渲染
 * @param options
 * @param tpl
 * @returns {*|Pagination}
 */
module.exports = function (options, tpl) {
    options = object.assign({}, defaults, options);

    var mode = options.mode;
    var parser = parsers[mode];

    if (!parser) {
        throw new Error('未知的`' + mode + '`模式分页解析器');
    }

    tpl = tpl || tpls[mode];

    return tpl.render(parser(options));
};
module.exports.defaults = defaults;

