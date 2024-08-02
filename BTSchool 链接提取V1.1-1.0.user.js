// ==UserScript==
// @name         BTSchool 链接提取V1.4
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  提取BTSchool当前页面的种子信息
// @author       武极 c04820@foxmail.com
// @match        https://pt.btschool.club/torrents.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建一个按钮元素
    var extractButton = document.createElement('button');
    extractButton.textContent = '提取并下载数据';
    extractButton.style.position = 'fixed';
    extractButton.style.top = '10px';
    extractButton.style.right = '10px';
    extractButton.style.zIndex = '1000';

    // 创建第二个按钮元素，用于一键复制所有下载链接
    var copyAllButton = document.createElement('button');
    copyAllButton.textContent = '一键复制所有下载链接';
    copyAllButton.style.position = 'fixed';
    copyAllButton.style.top = '40px';
    copyAllButton.style.right = '10px';
    copyAllButton.style.zIndex = '1000';

    // 将按钮添加到页面中
    document.body.appendChild(extractButton);
    document.body.appendChild(copyAllButton);

    // 用于存储提取的数据
    var extractedData = [];

    // 全局变量，用于存储你的passkey
    var passkey = 'abcdasdafsfawasfafwf'; // 请在这里替换为你的实际passkey

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

                                // 在每个<tr>元素右边附上一键复制按钮
                                var copyButton = document.createElement('button');
                                copyButton.textContent = '一键复制';
                                copyButton.style.width = '70px'; // 添加左边距，使按钮不紧贴表格内容
                                copyButton.addEventListener('click', function() {
                                    var downloadLink = 'https://pt.btschool.club/download.php?id=' + idMatch[1] + '&passkey=' + passkey;
                                    var tempTextArea = document.createElement('textarea');
                                    tempTextArea.value = downloadLink;
                                    document.body.appendChild(tempTextArea);
                                    tempTextArea.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(tempTextArea);
                                    alert('下载链接已复制到剪贴板！');
                                });
                                // 创建一个新的td元素来放置按钮
                                var newTd = document.createElement('td');
                                newTd.appendChild(copyButton);
                                tr.appendChild(newTd);
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

    // 页面加载完成后自动执行提取数据并添加一键复制按钮
    window.addEventListener('load', function() {
        extractData();
    });

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

    // 一键复制所有下载链接按钮点击事件处理函数
    copyAllButton.addEventListener('click', function() {
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

        // 创建一个临时的textarea元素用于复制内容
        var tempTextArea = document.createElement('textarea');
        tempTextArea.value = outputString;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);

        // 提示用户复制成功
        alert('所有下载链接已复制到剪贴板！');
    });
})();
