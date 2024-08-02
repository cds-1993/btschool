// ==UserScript==
// @name         BTSchool 链接提取V1.3
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  提取BTSchool当前页面的种子信息
// @author       武极 c04820@foxmail.com
// @match        https://pt.btschool.club/torrents.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建一个按钮元素
    var extractButton = document.createElement('button');
    extractButton.textContent = '提取本页种子详情';
    extractButton.style.position = 'fixed';
    extractButton.style.top = '10px';
    extractButton.style.right = '10px';
    extractButton.style.zIndex = '1000';

    // 创建第二个按钮元素
    var downloadButton = document.createElement('button');
    downloadButton.textContent = '仅生成自己的磁力链接';
    downloadButton.style.position = 'fixed';
    downloadButton.style.top = '40px';
    downloadButton.style.right = '10px';
    downloadButton.style.zIndex = '1000';

    // 将按钮添加到页面中
    document.body.appendChild(extractButton);
    document.body.appendChild(downloadButton);

    // 用于存储提取的数据
    var extractedData = [];

    // 全局变量，用于存储你的passkey
    var passkey = '你的key'; // 请在这里替换为你的实际passkey

    // 获取当前时间并格式化为YYYYMMDD_HHMMSS
    function getCurrentTime() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');
        return year + month + day + '_' + hours + minutes + seconds;
    }

    // 提取数据的函数
    function extractData() {
        // 找到第一个<table class="torrents">元素
        var table = document.querySelector('table.torrents');

        // 找到所有<tr>元素
        var trElements = table.querySelectorAll('tr');

        // 用于存储所有结果的数组
        var results = [];

        // 遍历所有<tr>元素
        trElements.forEach(function(tr, index) {
            // 跳过表头行（假设表头行是第一个<tr>）
            if (index === 0) return;

            var tdContents = [];
            var tds = tr.querySelectorAll('td.rowfollow.nowrap, td.rowfollow');

            // 遍历所有符合条件的<td>元素
            tds.forEach(function(td, tdIndex) {
                if (tdIndex === 0) {
                    // 第一个td元素，提取img标签下的title内容
                    var imgElement = td.querySelector('img');
                    if (imgElement && imgElement.hasAttribute('title')) {
                        tdContents.push(imgElement.getAttribute('title'));
                    } else {
                        tdContents.push('');
                    }
                } else if (tdIndex === 1) {
                    // 第二个td元素，提取其下面第一个class为embedded的<td>元素中的<a>标签的title内容和href内容
                    var embeddedTd = td.querySelector('td.embedded');
                    if (embeddedTd) {
                        var aElement = embeddedTd.querySelector('a');
                        if (aElement) {
                            var title = aElement.hasAttribute('title') ? aElement.getAttribute('title') : '';
                            var href = aElement.hasAttribute('href') ? aElement.getAttribute('href') : '';
                            tdContents.push(title + ' | ' + href);

                            // 提取id=XXX数据
                            var idMatch = href.match(/id=(\d+)/);
                            if (idMatch) {
                                extractedData.push(idMatch[1]);
                            }
                        } else {
                            tdContents.push('');
                        }
                    } else {
                        tdContents.push('');
                    }
                } else {
                    // 提取文字内容时，忽略img和a标签的title属性
                    var textContent = td.textContent.trim();
                    if (textContent) {
                        tdContents.push(textContent);
                    } else {
                        tdContents.push('');
                    }
                }
            });

            // 将同一个<tr>元素下的信息作为一行显示，中间用|分隔
            var result = tdContents.join(' | ');

            // 将结果添加到结果数组中
            results.push(result);
        });

        return results;
    }

    // 提取按钮点击事件处理函数
    extractButton.addEventListener('click', function() {
        var results = extractData();

        // 将结果数组转换为字符串，每行一个结果
        var outputString = results.join('\n');

        // 创建一个Blob对象，用于存储输出内容
        var blob = new Blob([outputString], {type: 'text/plain'});

        // 创建一个下载链接
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'output_' + getCurrentTime() + '.txt';

        // 将下载链接添加到文档中并触发点击事件
        document.body.appendChild(a);
        a.click();

        // 移除下载链接
        document.body.removeChild(a);
    });

    // 下载按钮点击事件处理函数
    downloadButton.addEventListener('click', function() {
        // 如果extractedData为空，则先执行提取操作
        if (extractedData.length === 0) {
            extractData();
        }

        // 生成下载链接列表
        var downloadLinks = extractedData.map(function(id) {
            return 'https://pt.btschool.club/download.php?id=' + id + '&passkey=' + passkey;
        });

        // 将下载链接列表转换为字符串，每行一个链接
        var outputString = downloadLinks.join('\n');

        // 创建一个Blob对象，用于存储输出内容
        var blob = new Blob([outputString], {type: 'text/plain'});

        // 创建一个下载链接
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'download_links_' + getCurrentTime() + '.txt';

        // 将下载链接添加到文档中并触发点击事件
        document.body.appendChild(a);
        a.click();

        // 移除下载链接
        document.body.removeChild(a);
    });
})();
