function jsonPath(obj, expr, arg) {
    var P = {
        resultType: arg && arg.resultType || "VALUE",
        result: [],
        normalize: function (expr) {
            var subx = [];
            return expr.replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) { return "[#" + (subx.push($1) - 1) + "]"; })
                .replace(/'?\.'?|\['?/g, ";")
                .replace(/;;;|;;/g, ";..;")
                .replace(/;$|'?\]|'$/g, "")
                .replace(/#([0-9]+)/g, function ($0, $1) { return subx[$1]; });
        },
        asPath: function (path) {
            var x = path.split(";"), p = "$";
            for (var i = 1, n = x.length; i < n; i++)
                p += /^[0-9*]+$/.test(x[i]) ? ("[" + x[i] + "]") : ("['" + x[i] + "']");
            return p;
        },
        store: function (p, v) {
            if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
            return !!p;
        },
        trace: function (expr, val, path) {
            if (expr) {
                var x = expr.split(";"), loc = x.shift();
                x = x.join(";");
                if (val && val.hasOwnProperty(loc))
                    P.trace(x, val[loc], path + ";" + loc);
                else if (loc === "*")
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { P.trace(m + ";" + x, v, p); });
                else if (loc === "..") {
                    P.trace(x, val, path);
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { typeof v[m] === "object" && P.trace("..;" + x, v[m], p + ";" + m); });
                }
                else if (/,/.test(loc)) { // [name1,name2,...]
                    for (var s = loc.split(/'?,'?/), i = 0, n = s.length; i < n; i++)
                        P.trace(s[i] + ";" + x, val, path);
                }
                else if (/^\(.*?\)$/.test(loc)) // [(expr)]
                    P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";") + 1)) + ";" + x, val, path);
                else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { if (P.eval(l.replace(/^\?\((.*?)\)$/, "$1"), v[m], m)) P.trace(m + ";" + x, v, p); });
                else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
                    P.slice(loc, x, val, path);
            }
            else
                P.store(path, val);
        },
        walk: function (loc, expr, val, path, f) {
            if (val instanceof Array) {
                for (var i = 0, n = val.length; i < n; i++)
                    if (i in val)
                        f(i, loc, expr, val, path);
            }
            else if (typeof val === "object") {
                for (var m in val)
                    if (val.hasOwnProperty(m))
                        f(m, loc, expr, val, path);
            }
        },
        slice: function (loc, expr, val, path) {
            if (val instanceof Array) {
                var len = val.length, start = 0, end = len, step = 1;
                loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function ($0, $1, $2, $3) { start = parseInt($1 || start); end = parseInt($2 || end); step = parseInt($3 || step); });
                start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
                end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
                for (var i = start; i < end; i += step)
                    P.trace(i + ";" + expr, val, path);
            }
        },
        eval: function (x, _v, _vname) {
            try { return $ && _v && eval(x.replace(/@/g, "_v")); }
            catch (e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a")); }
        }
    };

    var $ = obj;
    if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
        P.trace(P.normalize(expr).replace(/^\$;/, ""), obj, "$");
        return P.result.length ? P.result : false;
    }
}

// var ChromeRequest = (function () {
//     var requestId = 0;

//     function getData(data) {
//         var id = requestId++;

//         return new Promise(function (resolve, reject) {
//             var listener = function (evt) {
//                 if (evt.detail.requestId == id) {
//                     // Deregister self
//                     window.removeEventListener("sendChromeData", listener);
//                     resolve(evt.detail.data);
//                 }
//             }

//             window.addEventListener("sendChromeData", listener);

//             var payload = { data: data, id: id };

//             window.dispatchEvent(new CustomEvent("getChromeData", { detail: payload }));
//         });
//     }

//     return { getData: getData };
// })();

window.addEventListener('load', function () {
    // alert("It's loaded!");
    main();
})


function main() {
    // alert(jsonRespStr);
    // console.log(jsonRespStr);
    // code = jsonPath(jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
    // alert(code);
    // ChromeRequest.getData("jsonRespStr").then(function (data) { alert(data) });
    // Page context
    // alert(editAreas);
    // console.log(editAreas);
    // // alert(editArea);
    // // console.log(editArea);
    // // bm_script.textarea.value
    // // var message4 = jsonPath(editAreas, "x.bm_script.textarea.value");
    // var message4 = editAreas.bm_script;
    // alert(message4);
    // console.log(editAreas.bm_script);

    // alert(editArea.textarea.value);

    // editArea.textarea.value = "";
    // editArea.execCommand("onchange")
    // editAreas.bm_script.textarea.getValue

    // ISOLATE how to load editArea (not present in DOM to start)
    // editArea.textarea.value = "";
    // editArea.execCommand("onchange");
    // click in textarea

    // javasript:editArea.textarea.value = "REPLACED";
    // "REPLACED"
    // javascript:editArea.execCommand('onchange'); - DON'T NEED
    // undefined
    // javascript:editArea.textareaFocused=true;
    // javascript:editArea.textareaFocused=false;
    // "true"

    // frame_bm_script

    // WORKING REMOVE/REPLACE TEXT FROM CONSOLE
    // frame_bm_script.editArea.textarea.value = "REPLACED";
    // frame_bm_script.editArea.textareaFocused=true;

    // var replaced = window.location.href;
    // var replaced = window.frames;
    // frame_bm_script.editArea.textarea.value = "REPLACED";
    // alert(replaced);
    var message = jsonPath(jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
    var message1 = jsonPath(jsonRespStr, "x.widget.items[1].component.widget.items[0].component.widget.items[2].component.widget.items[0].component.widget.items[1].component.widget.items[0].component.data[0].value");
    var message3 = jsonPath(jsonRespStr, "x.widget.items[1].component.widget.items[0].component.widget.items[2].component.widget.items[0].component.widget.items[1].component.widget.items[0].component.data[1].value");
    var message2 = "TEST SCRIPT FROM INJECT.JS";

    // var x = document.getElementsByName("fname");

    var messages = message + message1 + message3;

    // alert(message1);
    // alert(message3);
    var event = new CustomEvent("PassToBackground", { detail: message });
    // var event2 = new CustomEvent("PassTestToBackground", { detail: message2 });
    window.dispatchEvent(event);
    // window.dispatchEvent(event2);
}

// main();