# blear.ui.pagination

[![npm module][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![coverage][coveralls-img]][coveralls-url]

[travis-img]: https://img.shields.io/travis/blearjs/blear.ui.pagination/master.svg?maxAge=2592000&style=flat-square
[travis-url]: https://travis-ci.org/blearjs/blear.ui.pagination

[npm-img]: https://img.shields.io/npm/v/blear.ui.pagination.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/blear.ui.pagination

[coveralls-img]: https://img.shields.io/coveralls/blearjs/blear.ui.pagination/master.svg?maxAge=2592000&style=flat-square
[coveralls-url]: https://coveralls.io/github/blearjs/blear.ui.pagination?branch=master


## 1、模式 mode
- simple 简单模式，只显示上一页、下一页，默认
- range 范围模式，显示一定范围的页码


## 2、范围模式简述
- 分页总数 < 范围数量，显示全部
- 分页总数 > 范围数量，显示部分
- 如果分页在前段，则后段（2/2）省略
- 如果分页在中段，则前段、后段部分（1/2）省略
- 如果分页在后段，则前段（2/2）省略


## 3、事件
- 发送 change:(page, next) 事件
- next(options)，渲染分页
- 交互结束

