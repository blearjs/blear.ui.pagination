/**
 * 文件描述
 * @author ydr.me
 * @create 2018-10-17 14:38
 * @update 2018-10-17 14:38
 */


'use strict';

var array = require('blear.utils.array');

/**
 * range mode 解析器
 * @param options
 */
module.exports = function (options) {
    var total = options.total;
    var range = options.range;
    var page = options.page;
    var ellipsis = options.ellipsis;
    var canRange = total > range;
    // type=1 => ellipsis
    // type=2 => number
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
                    text: item,
                    page: item
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

            // 当前页在左边右边界
            if (rangeLeftMax === page) {
                rangeLeftMax++;
                rangeRightMin++;
            }
            // 当前页在右边左边界
            else if (rangeRightMin === page) {
                rangeRightMin--;
                rangeLeftMax--;
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

    return {
        list: rangeList,
        options: options
    };
};



