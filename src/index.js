/**
 * 分页器
 * @author ydr.me
 * @create 2016-05-09 17:55
 */




'use strict';

var UI = require('blear.ui');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var time = require('blear.utils.time');
var MVVM = require('blear.classes.mvvm');
var selector = require('blear.core.selector');
var simpleTemplate = require('./simple.html', 'html');
var rangeTemplate = require('./range.html', 'html');

var defaults = {
    /**
     * 容器，如果容器不为空，则以容器的 html 作为分页模板
     * @type String|HTMLElement
     */
    el: null,

    /**
     * 分页模式
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
    ellipsis: '...',

    /**
     * 页面改变之后处理
     * @param page {Number} 分页值
     * @param next {Function} 处理完回调
     */
    onChange: function (page, next) {
        next();
    }
};
var Pagination = UI.extend({
    className: 'Pagination',
    constructor: function (options) {
        var the = this;

        Pagination.parent(the);
        options = the[_options] = object.assign(true, {}, defaults, options);
        the[_containerEl] = selector.query(options.el)[0];
        the[_processing] = false;

        options.range = Math.max(options.range, 3);

        switch (options.mode) {
            case 'range':
                the[_initRangeMode]();
                break;

            default:
                the[_initSimpleMode]();
                break;
        }

        time.nextTick(function () {
            the[_pageChange]();
        });
    }
});
var pro = Pagination.prototype;
var sole = Pagination.sole;
var _options = sole();
var _containerEl = sole();
var _initSimpleMode = sole();
var _simpleVM = sole();
var _initRangeMode = sole();
var _rangeVM = sole();
var _processing = sole();
var _pageChange = sole();


/**
 * 初始化 simple 模式
 */
pro[_initSimpleMode] = function () {
    var the = this;
    var options = the[_options];

    the[_containerEl].innerHTML = simpleTemplate;
    the[_simpleVM] = new MVVM({
        el: the[_containerEl],
        data: {
            options: options
        },
        methods: {
            onPrev: function () {
                if (the[_processing] || options.page <= 1) {
                    return;
                }

                the[_processing] = true;
                options.page--;
                the[_pageChange]();
            },
            onNext: function () {
                if (the[_processing] || options.page >= options.total) {
                    return;
                }

                the[_processing] = true;
                options.page++;
                the[_pageChange]();
            }
        }
    });
};


/**
 * 初始化 range 模式
 */
pro[_initRangeMode] = function () {
    var the = this;
    var options = the[_options];

    the[_rangeVM] = new ViewModel({
        el: the[_containerEl],
        template: rangeTemplate,
        data: {
            options: options
        },
        methods: {
            range: array.range,
            onPrev: function () {
                if (the[_processing] || options.page <= 1) {
                    return;
                }

                the[_processing] = true;
                options.page--;
                the[_pageChange]();
            },
            onNext: function () {
                if (the[_processing] || options.page >= options.total) {
                    return;
                }

                the[_processing] = true;
                options.page++;
                the[_pageChange]();
            },
            onPage: function (page) {
                the[_processing] = true;
                options.page = Number(page);
                the[_pageChange]();
            }
        }
    });
};


/**
 * 分页变化后
 */
pro[_pageChange] = function () {
    var the = this;
    var options = the[_options];

    the.emit('change', options.page, function (_options) {
        object.assign(options, _options);
        the[_processing] = false;
    });
};


require('./style.css', 'css|style');
Pagination.defaults = defaults;
module.exports = Pagination;
