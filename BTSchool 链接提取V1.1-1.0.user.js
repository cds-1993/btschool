// ==UserScript==
// @name         BTSchool 链接提取V1.2
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  提取BTSchool当前页面的种子信息，并只显示小于2GB的文件
// @author       武极 c04820@foxmail.com
// @match        https://pt.btschool.club/torrents.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 设置 passkey
    var passkeyValue = '20249959c55caa';

    // 创建按钮元素
    var extractButton = document.createElement('button');
    extractButton.textContent = '提取并下载数据';
    extractButton.style.position = 'fixed';
    extractButton.style.top = '10px';
    extractButton.style.right = '10px';
    extractButton.style.zIndex = '1000';
    document.body.appendChild(extractButton);

    // 获取当前时间并格式化为 YYYYMMDD_HHmmss
    function getCurrentFormattedTime() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    }

    // 提取按钮点击事件处理函数
    extractButton.addEventListener('click', function() {
        var table = document.querySelector('table.torrents');
        var trElements = table.querySelectorAll('tr');
        var results = new Set();

        trElements.forEach(function(tr, index) {
            if (index === 0) return; // 跳过表头行

            var tdContents = [];
            var sizeString = '';
            var sizeValue = 0;
            var idValue = '';
            tr.querySelectorAll('td.rowfollow.nowrap, td.rowfollow').forEach(function(td, tdIndex) {
                if (tdIndex === 1) { // 第二个td元素包含ID和href
                    var aElement = td.querySelector('td.embedded a');
                    if (aElement) {
                        idValue = aElement.href.match(/id=(\d+)/)[1];
                    }
                }
                if (tdIndex === 4) { // 第五个td元素包含文件大小
                    sizeString = td.textContent.trim();
                    if (sizeString.includes('TB')) {
                        sizeValue = parseFloat(sizeString) * 1024 * 1024; // 转换为MB
                    } else if (sizeString.includes('GB')) {
                        sizeValue = parseFloat(sizeString) * 1024; // 转换为MB
                    } else if (sizeString.includes('MB')) {
                        sizeValue = parseFloat(sizeString);
                    }
                }
                tdContents.push(td.textContent.trim());
            });

            if (sizeValue < 20480 && idValue) { // 只处理小于20GB的文件且ID不为空
                var downloadLink = `https://pt.btschool.club/download.php?id=${idValue}&passkey=${passkeyValue}`;
                tdContents.push(downloadLink); // 添加下载链接
                var resultString = tdContents.join(' | ');
                results.add(resultString); // 使用Set自动去重
            }
        });

        if (results.size > 0) {
            var outputString = Array.from(results).join('\n');
            var blob = new Blob([outputString], {type: 'text/plain'});
            var a = document.createElement('a');
            var currentTime = getCurrentFormattedTime();
            a.href = URL.createObjectURL(blob);
            a.download = `filtered_output_${currentTime}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('没有找到小于2GB的文件');
        }
    });
})();
