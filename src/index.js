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
var simpleTemplate = require('./simple.html');
var rangeTemplate = require('./range.html');

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
        the[_rangeData] = {list: []};

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
var _rangeData = sole();
var _containerEl = sole();
var _initSimpleMode = sole();
var _simpleVM = sole();
var _initRangeMode = sole();
var _rangeVM = sole();
var _processing = sole();
var _pageChange = sole();
var _processRange = sole();


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

    the[_containerEl].innerHTML = rangeTemplate;
    the[_rangeData].options = options;
    the[_rangeVM] = new MVVM({
        el: the[_containerEl],
        data: the[_rangeData],
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
            },
            onPage: function (item) {
                if (item.type === 1) {
                    return;
                }

                the[_processing] = true;
                options.page = Number(item.text);
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

    options.onChange(options.page, function next(_options) {
        object.assign(options, object.filter(_options || {}, ['page', 'total']));

        if (options.mode === 'range') {
            the[_processRange]();
        }

        the[_processing] = false;
    });

    the.emit('change', options.page);
};


pro[_processRange] = function () {
    var the = this;
    var options = the[_options];
    var pageData = the[_rangeData];
    var total = options.total;
    var range = options.range;
    var page = options.page;
    var ellipsis = options.ellipsis;
    var canRange = pageData.canRange = total > range;
    var rangeList = [];
    var pushRangeList = function (start, end) {
        var list;

        if (arguments.length === 1) {
            list = [{
                type: 1,
                text: ellipsis
            }];
        } else {
            list = array.range(start, end).map(function (item) {
                return {
                    type: 2,
                    text: item
                };
            });
        }

        rangeList = rangeList.concat(list);
    };

    if (canRange) {
        var rangeSlice = Math.floor(range / 3);
        var rangeSliceRemainLength = range - rangeSlice * 2 - 1;
        var rangeSliceLeftLength = Math.floor(rangeSliceRemainLength / 2);
        var rangeSliceRightLength = rangeSliceRemainLength - rangeSliceLeftLength;
        var rangeLeftMax = rangeSlice + 2;
        var rangeRightMin = total - rangeSlice - 1;
        rangeLeftMax = Math.min(rangeLeftMax, rangeRightMin);
        var rangeCurrentLeftMin = rangeLeftMax + rangeSliceLeftLength;
        var rangeCurrentRightMax = rangeRightMin - rangeSliceRightLength;

        if (page < rangeCurrentLeftMin || page > rangeCurrentRightMax) {
            // 1 ... [8] 9 10
            var normalLength = Math.floor(range / 2);
            var currentLength = range - normalLength;
            var alignLeft = page <= rangeLeftMax;
            var alignCenter = page < rangeLeftMax;
            rangeLeftMax = alignLeft ? currentLength : normalLength;
            rangeRightMin = total - (alignLeft ? normalLength : currentLength) + 1;

            // 左右互补
            if (page > rangeLeftMax && page < rangeRightMin) {
                var deltaLength = alignLeft ? page - rangeLeftMax : rangeRightMin - page;

                if (alignLeft) {
                    rangeLeftMax += deltaLength;
                    rangeRightMin += deltaLength;
                } else {
                    rangeLeftMax -= deltaLength;
                    rangeRightMin -= deltaLength;
                }
            }

            pushRangeList(1, rangeLeftMax);
            pushRangeList(ellipsis);
            pushRangeList(rangeRightMin, total);
        } else {
            pushRangeList(1, rangeSlice);
            pushRangeList(ellipsis);

            var centerMin = page - rangeSliceLeftLength;
            var centerMax = page + rangeSliceRightLength;

            pushRangeList(centerMin, centerMax);
            pushRangeList(ellipsis);
            pushRangeList(total - rangeSlice + 1, total);
        }
    } else {
        pushRangeList(1, total);
    }

    the[_rangeData].list = rangeList;
};


require('./style.css', 'css|style');
Pagination.defaults = defaults;
module.exports = Pagination;
