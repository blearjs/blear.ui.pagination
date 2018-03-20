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
var Template = require('blear.classes.template');
var selector = require('blear.core.selector');
var event = require('blear.core.event');
var attribute = require('blear.core.attribute');

var simpleTemplate = require('./simple.html');
var rangeTemplate = require('./range.html');

var simpleTpl = new Template(simpleTemplate);
var rangeTpl = new Template(rangeTemplate);
var namespace = 'blearui-pagination';
var defaults = {
    /**
     * 容器，如果容器不为空，则以容器的 html 作为分页模板
     * @type String|HTMLElement
     */
    el: null,

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
        // var divEl = modification.create('div');
        // modification.insert(divEl, the[_containerEl]);
        // the[_containerEl] = divEl;
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
    },

    /**
     * 改变页码
     * @param page
     * @returns {Pagination}
     */
    change: function (page) {
        var the = this;

        if (the[_processing]) {
            return the;
        }

        the[_processing] = true;
        the[_options].page = page;
        the[_pageChange]();
        return the;
    },

    /**
     * 渲染分页器
     * @param [configs]
     * @param [configs.page] {Number} 当前页码
     * @param [configs.total] {Number} 总页数
     * @returns {Pagination}
     */
    render: function (configs) {
        var the = this;
        var options = the[_options];

        object.assign(options, object.filter(configs || {}, ['page', 'total']));

        if (options.mode === 'range') {
            the[_processRange]();
        } else {
            the[_processSimple]();
        }

        return the;
    },

    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        event.un(the[_containerEl]);
        Pagination.invoke('destroy', the);
    }
});
var pro = Pagination.prototype;
var sole = Pagination.sole;
var _options = sole();
var _rangeData = sole();
var _containerEl = sole();
var _initSimpleMode = sole();
var _initRangeMode = sole();
var _processing = sole();
var _pageChange = sole();
var _processSimple = sole();
var _processRange = sole();


/**
 * 初始化 simple 模式
 */
pro[_initSimpleMode] = function () {
    var the = this;
    var options = the[_options];

    the[_processSimple]();

    event.on(the[_containerEl], 'click', '.' + namespace + '-item_prev', function () {
        if (the[_processing] || options.page <= 1) {
            return;
        }

        the[_processing] = true;
        options.page--;
        the[_pageChange]();
    });

    event.on(the[_containerEl], 'click', '.' + namespace + '-item_next', function () {
        if (the[_processing] || options.page >= options.total) {
            return;
        }

        the[_processing] = true;
        options.page++;
        the[_pageChange]();
    });
};


/**
 * 初始化 range 模式
 */
pro[_initRangeMode] = function () {
    var the = this;
    var options = the[_options];

    the[_processRange]();

    event.on(the[_containerEl], 'click', '.' + namespace + '-item_prev', function () {
        if (the[_processing] || options.page <= 1) {
            return;
        }

        the[_processing] = true;
        options.page--;
        the[_pageChange]();
    });

    event.on(the[_containerEl], 'click', '.' + namespace + '-item_next', function () {
        if (the[_processing] || options.page >= options.total) {
            return;
        }

        the[_processing] = true;
        options.page++;
        the[_pageChange]();
    });

    event.on(the[_containerEl], 'click', '.' + namespace + '-item_number', function () {
        if (the[_processing]) {
            return;
        }

        var clickPage = Number(attribute.text(this));

        if (clickPage === options.page) {
            return;
        }

        the[_processing] = true;
        options.page = clickPage;
        the[_pageChange]();
    });
};


/**
 * 分页变化后
 */
pro[_pageChange] = function () {
    var the = this;
    var options = the[_options];

    options.onChange(options.page, function next(configs) {
        the.render(configs);
        the[_processing] = false;
    });

    the.emit('change', options.page);
};


/**
 * 处理简单模式
 */
pro[_processSimple] = function () {
    var the = this;

    morph(the[_containerEl], simpleTpl.render({
        options: the[_options]
    }));
};

/**
 * 处理范围模式
 */
pro[_processRange] = function () {
    var the = this;
    var options = the[_options];
    var total = options.total;
    var range = options.range;
    var page = options.page;
    var ellipsis = options.ellipsis;
    var canRange = total > range;
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

            if (rangeLeftMax === page) {
                rangeLeftMax++;
            } else if (rangeRightMin === page) {
                rangeRightMin--;
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

    morph(the[_containerEl], rangeTpl.render({
        list: rangeList,
        options: options
    }));
};


require('./style.css', 'css|style');
Pagination.defaults = defaults;
module.exports = Pagination;


function morph(el, html) {
    el.innerHTML = html;
}
