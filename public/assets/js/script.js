/*
 *  This file defines all global function
 */
(function(exports) { 'use strict';

// Check if passed-in is an javascript object
exports.isObj = function(inData) {
    return Object.prototype.toString.call(inData) === '[object Object]';
}

// use noty.js to display message;
exports.showMsg = function(obj) {
    // Null check
    if (!exports.isObj(obj)) return;
    if (!obj.text && !obj.message) return;
    
    // Show message
    try {
        new Noty({
            theme: 'relax',
            layout: obj.layout ? obj.layout : 'bottomRight',
            type: obj.type ? obj.type : 'information',
            text: obj.message ? obj.message : obj.text,
            timeout: obj.timeout ? obj.timeout : 3000
            // maxVisible: 3,
            // killer: true
        }).show();
    }
    catch (e) {
        console.error(e);
    };
}

})(typeof exports === 'undefined' ? window : exports);