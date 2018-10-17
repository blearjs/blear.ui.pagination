/**
 * 分页器
 * @author ydr.me
 * @create 2016-05-09 17:55
 */




'use strict';

var UI = require('blear.ui');
var object = require('blear.utils.object');
var selector = require('blear.core.selector');
var event = require('blear.core.event');
var attribute = require('blear.core.attribute');

var render = require('./render');

var namespace = 'blearui-pagination';
var defaults = object.assign({}, render.defaults, {
    /**
     * 容器，如果容器不为空，则以容器的 html 作为分页模板
     * @type String|HTMLElement
     */
    el: null,

    /**
     * 页码改变之后处理
     * @param page {Number} 分页值
     * @param next {Function} 处理完回调
     */
    onChange: function (page, next) {
        // 可以修改当前页码及总页
        next(/*{page, total}*/);
    }
});
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
        the[_processRender]();

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
var _processRender = sole();


/**
 * 初始化 simple 模式
 */
pro[_initSimpleMode] = function () {
    var the = this;
    var options = the[_options];

    the[_processRender]();

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

    the[_processRender]();

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
 * 处理渲染
 */
pro[_processRender] = function () {
    var the = this;

    morph(the[_containerEl], render(the[_options]));
};


require('./style.css', 'css|style');
Pagination.defaults = defaults;
module.exports = Pagination;


function morph(el, html) {
    el.innerHTML = html;
}
