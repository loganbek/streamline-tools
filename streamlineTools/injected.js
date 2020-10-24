function jsonPath(obj, expr, arg) {
    var P = {
        resultType: arg && arg.resultType || "VALUE",
        result: [],
        normalize: function(expr) {
            var subx = [];
            return expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0, $1) { return "[#" + (subx.push($1) - 1) + "]"; })
                .replace(/'?\.'?|\['?/g, ";")
                .replace(/;;;|;;/g, ";..;")
                .replace(/;$|'?\]|'$/g, "")
                .replace(/#([0-9]+)/g, function($0, $1) { return subx[$1]; });
        },
        asPath: function(path) {
            var x = path.split(";"),
                p = "$";
            for (var i = 1, n = x.length; i < n; i++)
                p += /^[0-9*]+$/.test(x[i]) ? ("[" + x[i] + "]") : ("['" + x[i] + "']");
            return p;
        },
        store: function(p, v) {
            if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
            return !!p;
        },
        trace: function(expr, val, path) {
            if (expr) {
                var x = expr.split(";"),
                    loc = x.shift();
                x = x.join(";");
                if (val && val.hasOwnProperty(loc))
                    P.trace(x, val[loc], path + ";" + loc);
                else if (loc === "*")
                    P.walk(loc, x, val, path, function(m, l, x, v, p) { P.trace(m + ";" + x, v, p); });
                else if (loc === "..") {
                    P.trace(x, val, path);
                    P.walk(loc, x, val, path, function(m, l, x, v, p) { typeof v[m] === "object" && P.trace("..;" + x, v[m], p + ";" + m); });
                } else if (/,/.test(loc)) { // [name1,name2,...]
                    for (var s = loc.split(/'?,'?/), i = 0, n = s.length; i < n; i++)
                        P.trace(s[i] + ";" + x, val, path);
                } else if (/^\(.*?\)$/.test(loc)) // [(expr)]
                    P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";") + 1)) + ";" + x, val, path);
                else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
                    P.walk(loc, x, val, path, function(m, l, x, v, p) { if (P.eval(l.replace(/^\?\((.*?)\)$/, "$1"), v[m], m)) P.trace(m + ";" + x, v, p); });
                else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
                    P.slice(loc, x, val, path);
            } else
                P.store(path, val);
        },
        walk: function(loc, expr, val, path, f) {
            if (val instanceof Array) {
                for (var i = 0, n = val.length; i < n; i++)
                    if (i in val)
                        f(i, loc, expr, val, path);
            } else if (typeof val === "object") {
                for (var m in val)
                    if (val.hasOwnProperty(m))
                        f(m, loc, expr, val, path);
            }
        },
        slice: function(loc, expr, val, path) {
            if (val instanceof Array) {
                var len = val.length,
                    start = 0,
                    end = len,
                    step = 1;
                loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function($0, $1, $2, $3) {
                    start = parseInt($1 || start);
                    end = parseInt($2 || end);
                    step = parseInt($3 || step);
                });
                start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
                end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
                for (var i = start; i < end; i += step)
                    P.trace(i + ";" + expr, val, path);
            }
        },
        eval: function(x, _v, _vname) {
            try { return $ && _v && eval(x.replace(/@/g, "_v")); } catch (e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a")); }
        }
    };

    var $ = obj;
    if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
        P.trace(P.normalize(expr).replace(/^\$;/, ""), obj, "$");
        return P.result.length ? P.result : false;
    }
}

window.addEventListener('load', function() {
    main();
})


function main() {

    // if (typeof jsonRespStr !== undefined) {
    //         alert(typeof jsonRespStr);
    let message = jsonPath(jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
    let message1 = jsonPath(jsonRespStr, "x.widget.items[1].component.widget.items[0].component.widget.items[2].component.widget.items[0].component.widget.items[1].component.widget.items[0].component.data[0].value");
    let message3 = jsonPath(jsonRespStr, "x.widget.items[1].component.widget.items[0].component.widget.items[2].component.widget.items[0].component.widget.items[1].component.widget.items[0].component.data[1].value");
    // }
    let message2 = "TEST SCRIPT FROM INJECT.JS";
    //     let messages = message + message1 + message3;
    let propertyReturnType = document.getElementById('ext-comp-1009').value;
    let parameterName = document.getElementsByClassName('x-grid3-col-paramName');
    let parameterType = document.getElementsByClassName('x-grid3-col-paramType');
    let variableName = document.getElementById('variableName').value;
    let params = "";
    for (let i = 0; i < parameterName.length; i++) {
        params += "- " + parameterName[i].innerHTML + " (" + parameterType[i].innerHTML + ")\n";
    }
    let returnType = "- " + propertyReturnType + "\n";

    let commentHeader2 = "/*\n" + variableName + "\n@param\n" + params + "@return\n" + returnType + "*/ ";
    let commentHeaderEvent = new CustomEvent("PassCommentHeader", { detail: commentHeader2 });
    let event = new CustomEvent("PassToBackground", { detail: message });
    window.dispatchEvent(event);
    window.dispatchEvent(commentHeaderEvent);
}

window.addEventListener('unloadCode', function(evt) {
        let event = new CustomEvent("PassCodeToBackground", { detail: frame_bm_script.editArea.textarea.value });
        window.dispatchEvent(event);
    })
    //Listen for the load code event
window.addEventListener("loadCode", function(evt) {
    code = evt.detail;
    frame_bm_script.editArea.textarea.value = code;
    frame_bm_script.editArea.textareaFocused = true;

    //Perform Validation
    // document.getElementById('ext-gen22').click();
    document.getElementsByClassName('bmx-spellcheck')[0].click();
}, false);

//Listen for the load test code event
window.addEventListener("loadTestCode",
    function(evt) {
        code = evt.detail;
        //need to rewrite these if's
        let commTestScript = document.getElementById('ext-comp-1080');
        let utilTestScript = document.getElementById('ext-comp-1040');
        let commTestScript2 = document.getElementById('ext-comp-1095');
        if (utilTestScript) {
            utilTestScript.value = code;
        } else if (commTestScript) {
            commTestScript.value = code;
        } else if (commTestScript2) {
            commTestScript2.value = code;
        }
        // alert(commTestScript, commTestScript2, utilTestScript);
        //RUN DEBUGGER
        // <button class="x-btn-text bmx-debug" type="button" id="ext-gen268">Run</button>
        // document.getElementById('ext-gen268').click();
        document.getElementsByClassName('bmx-debug')[1].click();
        // alert(document.getElementsByClassName('bmx-debug'));
    }, false);

window.addEventListener("unloadTestCode",
    function(evt) {
        let testScript;
        let useTestScript = document.getElementById('useScript').checked;
        if (useTestScript) {
            let commTestScript = document.getElementById('ext-comp-1080');
            let utilTestScript = document.getElementById('ext-comp-1040');
            //ext-comp-1095
            let commTestScript2 = document.getElementById('ext-comp-1095');
            if (utilTestScript) {
                testScript = utilTestScript.value;
            } else if (commTestScript) {
                testScript = commTestScript.value;
            } else if (commTestScript2) {
                testScript = commTestScript2.value;
            }
            if (testScript == "") {
                testScript = "\n";
            }
            // alert("commTestScript: " + commTestScript);
            // alert("utilTestScript: " + utilTestScript);
            let event = new CustomEvent("PassTestCodeToBackground", { detail: testScript });
            window.dispatchEvent(event);
        } else {
            alert("Please Check - Use Test Script.");
        }
    }, false);