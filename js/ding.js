const { ipcRenderer, ipcMain } = require("electron");

var changing = null;
var photos = {};
var photos2 = {};
ipcRenderer.on("img", (event, wid, x, y, w, h, url) => {
    photos[wid] = photos2[wid] = [x, y, w, h];
    var div = document.createElement("div");
    div.id = wid;
    div.className = "ding_photo";
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";
    var img = document.createElement("img");
    img.src = url;
    img.className = "img";
    var tool_bar = document.querySelector("#tool_bar").cloneNode(true);
    tool_bar.querySelector("#tool_bar_c").style.display = "flex";
    // 顶栏
    div.onmouseenter = () => {
        tool_bar.querySelector("#tool_bar_c").style.transform = "translateY(0)";
    };
    div.onmouseleave = () => {
        tool_bar.querySelector("#tool_bar_c").style.transform = "translateY(-105%)";
    };
    // 透明
    窗口透明度 = tool_bar.querySelector("#透明度");
    窗口透明度.oninput = () => {
        img.style.opacity = `${窗口透明度.value / 100}`;
    };
    tool_bar.querySelector("#minimize").onclick = () => {
        minimize(wid);
    };
    tool_bar.querySelector("#back").onclick = () => {
        back(div);
    };
    tool_bar.querySelector("#close").onclick = () => {
        close(div);
    };
    div.onclick = () => {
        div.style.zIndex = toppest + 1;
        toppest += 1;
    };
    div.appendChild(tool_bar);
    div.appendChild(img);
    document.querySelector("#photo").appendChild(div);
});

function minimize(id) {}
function back(el) {
    el.style.transition = "var(--transition)";
    setTimeout(() => {
        el.style.transition = "";
    }, 400);
    var p_s = photos[el.id];
    el.style.left = p_s[0] + "px";
    el.style.top = p_s[1] + "px";
    el.style.width = p_s[2] + "px";
    el.style.height = p_s[3] + "px";
    ipcRenderer.send("ding_p_s", el.id, p_s);
}
function close(el) {
    el.innerHTML = "";
    el.parentNode.removeChild(el);
    delete photos[el.id];
    delete photos2[el.id];
    ipcRenderer.send("ding_close", el.id);
}

// 最高窗口
toppest = 1;

window_div = null;
document.onmousedown = (e) => {
    if (e.target.id != "透明度" || e.target.id != "size") {
        div = e.target;
        if (div.id != "photo")
            while (div.className != "ding_photo") {
                div = div.offsetParent;
            }
        window_div = div;
        o_ps = [div.offsetLeft, div.offsetTop, div.offsetWidth, div.offsetHeight];
        changing = e;
        ipcRenderer.send("ding_ignore", true);
    }
};
document.onmousemove = (e) => {
    if (window_div == null) {
        div = e.target;
        if (div.id != "photo")
            while (div.className != "ding_photo") {
                div = div?.offsetParent;
            }
        cursor(div, e);
    } else {
        cursor(window_div, e);
    }
};
document.onmouseup = (e) => {
    o_ps = [];
    changing = null;
    window_div = null;
    ipcRenderer.send("ding_ignore", false);
};

direction = "";
function cursor(el, e) {
    var width = el.offsetWidth,
        height = el.offsetHeight;
    var p_x = e.clientX - el.offsetLeft,
        p_y = e.clientY - el.offsetTop;

    var num = 8;
    // 光标样式
    if (window_div == null)
        switch (true) {
            case p_x <= num && p_y <= num:
                el.style.cursor = "nw-resize";
                direction = "西北";
                break;
            case p_x >= width - num && p_y >= height - num:
                el.style.cursor = "se-resize";
                direction = "东南";
                break;
            case p_x >= width - num && p_y <= num:
                el.style.cursor = "ne-resize";
                direction = "东北";
                break;
            case p_x <= num && p_y >= height - num:
                el.style.cursor = "sw-resize";
                direction = "西南";
                break;
            case p_x <= num:
                el.style.cursor = "w-resize";
                direction = "西";
                break;
            case p_x >= width - num:
                el.style.cursor = "e-resize";
                direction = "东";
                break;
            case p_y <= num:
                el.style.cursor = "n-resize";
                direction = "北";
                break;
            case p_y >= height - num:
                el.style.cursor = "s-resize";
                direction = "南";
                break;
            case num < p_x && p_x < width - num && num < p_y && p_y < height - num:
                el.style.cursor = "default";
                direction = "move";
                break;
            default:
                el.style.cursor = "default";
                direction = "";
                break;
        }
    if (changing != null && o_ps != []) {
        var o_e = changing;
        var o_x = o_e.clientX,
            n_x = e.clientX,
            o_y = o_e.clientY,
            n_y = e.clientY;
        var dx = n_x - o_x,
            dy = n_y - o_y;
        var p_s;
        switch (direction) {
            case "move":
                p_s = [o_ps[0] + dx, o_ps[1] + dy, o_ps[2], o_ps[3]];
                break;
        }
        el.style.left = p_s[0] + "px";
        el.style.top = p_s[1] + "px";
        el.style.width = p_s[2] + "px";
        el.style.height = p_s[3] + "px";
        ipcRenderer.send("ding_p_s", el.id, p_s);
    }
}
