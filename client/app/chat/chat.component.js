"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var myGlobals = require("../globals");
var ChatComponent = (function () {
    /**---------------------------------------------------------------------*/
    function ChatComponent(elemref, router) {
        this.elemref = elemref;
        this.router = router;
        this.userloggedin = [];
        this.socket = io.connect("http://" + myGlobals.IPaddress);
        /**  --------------------shapes draw code----------------------------*/
        this.pencil = true;
        this.eraser = false;
        this.line = false;
        this.circle = false;
        this.rectangle = false;
        this.open1 = false;
        this.open2 = false;
    }
    ChatComponent.prototype.ngAfterViewInit = function () {
        this.canvas = document.getElementById('drawing');
        this.canvas2 = document.getElementById('tmp_drawing');
        this.ctx2 = this.canvas2.getContext("2d");
        this.ctx = this.canvas.getContext("2d");
        this.color = "#000000";
        this.paint = false;
        this.lineWidth = 2;
        $('#tmp_drawing').css('cursor', "url('images/pencil_cursor.cur') 5 5, pointer");
    };
    ChatComponent.prototype.onMouseButtonUp = function (e) {
        this.paint = false;
        var mouseX = e.pageX - this.canvas.offsetLeft;
        var mouseY = e.pageY - this.canvas.offsetTop;
        if (this.line == true) {
            var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: mouseX, y: mouseY }];
            this.EmitDrawData(line, "line", this.paint, this.color);
        }
        else if (this.rectangle == true) {
            var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: mouseX, y: mouseY }];
            this.EmitDrawData(line, "rectangle", this.paint, this.color);
        }
        else if (this.circle == true) {
            var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: mouseX, y: mouseY }];
            this.EmitDrawData(line, "circle", this.paint, this.color);
        }
    };
    ChatComponent.prototype.makeMouseButtonUp = function (shape, line, color) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
        this.ctx.beginPath();
        if (shape == "line") {
            this.ctx.moveTo(line[0].x, line[0].y);
            this.ctx.lineTo(line[1].x, line[1].y);
            this.ctx.stroke();
        }
        else if (shape == "rectangle") {
            this.ctx.moveTo(line[0].x, line[0].y);
            var a = Math.min(line[1].x, line[0].x);
            var b = Math.min(line[1].y, line[0].y);
            var width = Math.abs(line[1].x - line[0].x);
            var height = Math.abs(line[1].y - line[0].y);
            this.ctx.strokeRect(a, b, width, height);
        }
        else if (shape == "circle") {
            var a = (line[1].x + line[0].x) / 2;
            var b = (line[1].y + line[0].y) / 2;
            var radius = Math.max(Math.abs(line[1].x - line[0].x), Math.abs(line[1].y - line[0].y) / 2);
            this.ctx.arc(a, b, radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
        }
    };
    ChatComponent.prototype.onMouseOut = function (event) {
        this.paint = false;
    };
    ChatComponent.prototype.onMouseMove = function (e) {
        if (this.paint) {
            var mouseX = e.pageX - this.canvas.offsetLeft;
            var mouseY = e.pageY - this.canvas.offsetTop;
            var emitShape = "pencil";
            if (this.eraser == true) {
                emitShape = "eraser";
            }
            if (this.pencil == true || this.eraser == true) {
                var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: mouseX, y: mouseY }];
                this.EmitDrawData(line, emitShape, this.paint, this.color);
                this.startmouseX = mouseX;
                this.startmouseY = mouseY;
            }
            else if (this.line == true) {
                this.onPaintLine(mouseX, mouseY);
            }
            else if (this.rectangle == true) {
                this.onPaintRectangle(mouseX, mouseY);
            }
            else if (this.circle == true) {
                this.onPaintCircle(mouseX, mouseY);
            }
        }
    };
    ChatComponent.prototype.makeMouseMove = function (shape, line, color) {
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineJoin = this.ctx.lineCap = 'round';
        this.ctx2.lineWidth = this.lineWidth;
        this.ctx2.lineJoin = this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = color;
        this.ctx2.strokeStyle = color;
        if (shape == "eraser") {
            this.ctx.strokeStyle = "white";
            this.ctx2.strokeStyle = "white";
            this.ctx.lineWidth = 10;
            this.ctx2.lineWidth = 10;
        }
        if (shape == "pencil" || shape == "eraser") {
            this.ctx.beginPath();
            this.ctx.moveTo(line[0].x, line[0].y);
            this.ctx.lineTo(line[1].x, line[1].y);
            this.ctx.stroke();
        }
        else if (shape == "line") {
            this.drawPaintLine(line, color);
        }
        else if (shape == "rectangle") {
            this.drawPaintRectangle(line, color);
        }
        else if (shape == "circle") {
            this.drawPaintCircle(line, color);
        }
    };
    ChatComponent.prototype.onMouseButtonDown = function (e) {
        var mouseX = e.pageX - this.canvas2.offsetLeft;
        var mouseY = e.pageY - this.canvas2.offsetTop;
        this.paint = true;
        this.startmouseX = mouseX;
        this.startmouseY = mouseY;
    };
    ChatComponent.prototype.onKeyPress = function (event) {
        console.log("filedata emitting");
        this.socket.emit('file_data', { para: document.getElementById('editFile').value });
    };
    ChatComponent.prototype.onKeyEnter = function (event) {
        if (document.getElementById('btn-input').value.trim() == "") {
            document.getElementById("btn-chat1").disabled = true;
        }
        else {
            document.getElementById("btn-chat1").disabled = false;
            var key = event.which;
            if (key == 13) {
                this.msgclick();
            }
        }
    };
    /**-------------------------------new canvas drawing feat---------------------------------------------*/
    ChatComponent.prototype.onPaintLine = function (x, y) {
        var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: x, y: y }];
        this.EmitDrawData(line, "line", this.paint, this.color);
    };
    ChatComponent.prototype.drawPaintLine = function (line, color) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
        this.ctx2.beginPath();
        this.ctx2.moveTo(line[0].x, line[0].y);
        this.ctx2.lineTo(line[1].x, line[1].y);
        this.ctx2.strokeStyle = color;
        this.ctx2.stroke();
        this.ctx2.closePath();
    };
    ChatComponent.prototype.onPaintRectangle = function (x, y) {
        var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: x, y: y }];
        this.EmitDrawData(line, "rectangle", this.paint, this.color);
    };
    ChatComponent.prototype.drawPaintRectangle = function (line, color) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
        this.ctx2.beginPath();
        this.ctx2.moveTo(line[0].x, line[0].y);
        var a = Math.min(line[1].x, line[0].x);
        var b = Math.min(line[1].y, line[0].y);
        var width = Math.abs(line[1].x - line[0].x);
        var height = Math.abs(line[1].y - line[0].y);
        this.ctx2.strokeStyle = color;
        this.ctx2.strokeRect(a, b, width, height);
    };
    ChatComponent.prototype.onPaintCircle = function (x, y) {
        var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: x, y: y }];
        this.EmitDrawData(line, "circle", this.paint, this.color);
    };
    ChatComponent.prototype.drawPaintCircle = function (line, color) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
        var a = (line[1].x + line[0].x) / 2;
        var b = (line[1].y + line[0].y) / 2;
        var radius = Math.max(Math.abs(line[1].x - line[0].x), Math.abs(line[1].y - line[0].y)) / 2;
        this.ctx2.beginPath();
        this.ctx2.arc(a, b, radius, 0, Math.PI * 2, false);
        this.ctx2.strokeStyle = color;
        this.ctx2.stroke();
        this.ctx2.closePath();
    };
    /**--------------------------------------------------------------------------------*/
    //line is coordinates 
    ChatComponent.prototype.EmitDrawData = function (line, shape, temp, color) {
        var obj = {
            'line': line,
            'shape': shape,
            'temp': temp,
            'color': color
        };
        this.socket.emit("draw_shape", obj);
    };
    ChatComponent.prototype.setCanvasSize = function () {
        if (this.open1) {
            var canParElem = document.getElementById("canvasParent");
            this.canvas.width = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("width"), 10);
            this.canvas.height = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("height"), 10);
            this.ctx = this.canvas.getContext("2d");
            this.canvas2.width = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("width"), 10);
            this.canvas2.height = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("height"), 10);
            this.ctx2 = this.canvas2.getContext("2d");
            $("#tmp_drawing").offset({ top: this.canvas.offsetTop, left: this.canvas.offsetLeft });
            this.socket.emit("draw_history");
        }
    };
    ChatComponent.prototype.ngOnInit = function () {
        var _this = this;
        var route = this.router;
        this.socket.on('connect', function () {
            console.log("user connected");
        });
        this.socket.on('set_title', function (userName) {
            _this.chatCaption = userName;
        });
        this.socket.on('redirect', function () {
            console.log("oops!!server Restarts....");
            localStorage.removeItem("userId");
            document.getElementById("submit").submit();
            //route.navigate(['/login']);
        });
        this.socket.on('history', function (line_history, file_data) {
            for (var i in line_history) {
                console.log("history received to new user" + line_history[i]);
                var data = line_history[i];
                _this.ctx.beginPath();
                _this.ctx.lineWidth = _this.lineWidth;
                if (data.shape == "line" || data.shape == "pencil" || data.shape == "eraser") {
                    _this.ctx.moveTo(data.line[0].x, data.line[0].y);
                    _this.ctx.lineTo(data.line[1].x, data.line[1].y);
                    _this.ctx.stroke();
                }
                else if (data.shape == "rectangle") {
                    _this.ctx.moveTo(data.line[0].x, data.line[0].y);
                    var a = Math.min(data.line[1].x, data.line[0].x);
                    var b = Math.min(data.line[1].y, data.line[0].y);
                    var width = Math.abs(data.line[1].x - data.line[0].x);
                    var height = Math.abs(data.line[1].y - data.line[0].y);
                    _this.ctx.strokeRect(a, b, width, height);
                }
                else if (data.shape == "circle") {
                    var a = (data.line[1].x + data.line[0].x) / 2;
                    var b = (data.line[1].y + data.line[0].y) / 2;
                    var radius = Math.max(Math.abs(data.line[1].x - data.line[0].x), Math.abs(data.line[1].y - data.line[0].y) / 2);
                    _this.ctx.arc(a, b, radius, 0, Math.PI * 2, false);
                    _this.ctx.stroke();
                }
            }
            document.getElementById('editFile').value = file_data;
        });
        /**------------------drag and drop code -------------------------*/
        var dropZone = document.getElementById('editFile');
        dropZone.addEventListener('dragover', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }, false);
        dropZone.addEventListener('drop', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var files = evt.dataTransfer.files; // FileList object.
            var reader = new FileReader();
            var socket = _this.socket;
            reader.onload = function (event) {
                document.getElementById('editFile').value = event.target.result;
                socket.emit('file_data', { para: event.target.result });
            };
            reader.readAsText(files[0], "UTF-8");
        }, false);
        /**-----------------------------------------------------------*/
        $("#eraser").click(function () {
            _this.pencil = false;
            _this.eraser = true;
            _this.line = false;
            _this.circle = false;
            _this.rectangle = false;
            $('#tmp_drawing').css('cursor', "url('images/eraser_cursor.cur') 5 5, pointer");
            $("#pencil").removeClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").addClass('clicked');
        });
        $("#pencil").click(function () {
            _this.pencil = true;
            _this.eraser = false;
            _this.line = false;
            _this.circle = false;
            _this.rectangle = false;
            $('#tmp_drawing').css('cursor', "url('images/pencil_cursor.cur') 5 5, pointer");
            $("#pencil").addClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").removeClass('clicked');
        });
        $("#circle").click(function () {
            _this.pencil = false;
            _this.eraser = false;
            _this.line = false;
            _this.circle = true;
            _this.rectangle = false;
            $('#tmp_drawing').css('cursor', "crosshair");
            $("#pencil").removeClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").addClass('clicked');
            $("#eraser").removeClass('clicked');
        });
        $("#clearCanvas").click(function () {
            _this.ctx.clearRect(0, 0, _this.canvas2.width, _this.canvas2.height);
            _this.ctx2.clearRect(0, 0, _this.canvas2.width, _this.canvas2.height);
            _this.socket.emit("clear_canvas");
        });
        $("#clearEditor").click(function () {
            document.getElementById('editFile').value = '';
            _this.socket.emit("clear_file");
        });
        this.socket.on("clear_canvas", function () {
            _this.ctx.clearRect(0, 0, _this.canvas2.width, _this.canvas2.height);
            _this.ctx2.clearRect(0, 0, _this.canvas2.width, _this.canvas2.height);
        });
        this.socket.on("clear_file", function () {
            document.getElementById('editFile').value = '';
        });
        $("#line").click(function () {
            _this.pencil = false;
            _this.eraser = false;
            _this.line = true;
            _this.circle = false;
            _this.rectangle = false;
            $('#tmp_drawing').css('cursor', "crosshair");
            $("#pencil").removeClass('clicked');
            $("#line").addClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").removeClass('clicked');
        });
        $("#rectangle").click(function () {
            _this.pencil = false;
            _this.eraser = false;
            _this.line = false;
            _this.circle = false;
            _this.rectangle = true;
            $('#tmp_drawing').css('cursor', "crosshair");
            $("#pencil").removeClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").addClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").removeClass('clicked');
        });
        window.addEventListener('resize', this.setCanvasSize);
        $(window).resize(function () {
            _this.setCanvasSize();
        });
        this.socket.on('updated_file', function (data) {
            document.getElementById('editFile').value = data;
        });
        this.socket.on('draw_shape', function (data) {
            console.log("draw shape");
            if (data.temp) {
                _this.makeMouseMove(data.shape, data.line, data.color);
            }
            else {
                _this.makeMouseButtonUp(data.shape, data.line, data.color);
            }
        });
        /**  this.socket.on('draw_history_line', function (line_history) {
 
             var canvas = <HTMLCanvasElement>document.getElementById('drawing');
             var ctx = canvas.getContext("2d");
 
             var hist_data = line_history.data;
 
             for (var i in hist_data) {
                 var data = hist_data[i];
                 var line = data.line;
                 ctx.beginPath();
                 ctx.lineCap = 'round';
                 ctx.moveTo(line[1].x, line[1].y);
                 ctx.lineTo(line[0].x, line[0].y);
                 ctx.strokeStyle = data.color;
                 ctx.lineWidth = 2;
                 ctx.stroke();
             }
 
         });*/
        this.socket.on('connect', function () {
            console.log("user connected");
        });
        this.socket.on("chat message", function (msg, name) {
            var htmlStr = "";
            console.log(msg);
            var currentdate = new Date();
            var currHr = currentdate.getHours();
            var timeStr = "AM";
            if (currHr > 12 && currHr <= 23) {
                currHr = currHr - 12;
                timeStr = "PM";
            }
            if (currHr == 0) {
                currHr = 12;
            }
            var datetime = currHr + ":"
                + currentdate.getMinutes() + " "
                + timeStr;
            var obj = document.createElement('li');
            htmlStr += "<div class='msg_container base_receive'>";
            htmlStr += "<div class='avatar' style='padding-left:0;'>";
            htmlStr += "<figure class='pull-left'>";
            htmlStr += "<img style='width:70px; padding-right:10px;' src='../../images/avatar_girl.png'>";
            htmlStr += "</figure>";
            htmlStr += "</div>";
            htmlStr += "<div style='padding-left:0;'>";
            htmlStr += "<div class='messages msg_receive'>";
            htmlStr += "<p class='sender_name'>" + name + ":</p><br/>";
            htmlStr += "<p class='msg_txt'>" + msg + "</p><br/>";
            htmlStr += "<time datetime='" + currentdate + "'> " + datetime + "</time>";
            htmlStr += "</div></div></div>";
            obj.innerHTML = htmlStr;
            (document.getElementById("messages")).append(obj);
            //scrolls to bottom
            var chatElem = document.getElementById("chat");
            chatElem.scrollTop = chatElem.scrollHeight;
        });
        $(this.elemref.nativeElement).find('#drawing').css('cursor', "url('images/pencil.png') 0 52, pointer");
    };
    ChatComponent.prototype.change = function () {
        this.color = document.getElementById('color').value;
        document.getElementById('drawing').style.cursor = "url('images/pencil.png') 0 52, pointer";
    };
    ChatComponent.prototype.Onclick1 = function () {
        var _this = this;
        this.open1 = !this.open1;
        if (this.open1 && this.open2) {
            document.getElementById('div2').style.display = 'inline-block';
            /**$(this.elemref.nativeElement).find('#div2').animate({width:'49%'},500,() =>{
            });*/
            document.getElementById('div3').style.display = 'none';
            this.open2 = false;
            this.setCanvasSize();
        }
        else if (this.open1) {
            $(this.elemref.nativeElement).find('#div1').animate({ width: '50%' }, 500, function () {
                document.getElementById('div1').style.display = 'inline-block';
                document.getElementById('div2').style.display = 'inline-block';
                _this.setCanvasSize();
            });
        }
        else {
            $(this.elemref.nativeElement).find('#div1').animate({ 'width': '100%' });
            document.getElementById('div2').style.display = 'none';
        }
    };
    ChatComponent.prototype.Onclick2 = function () {
        this.open2 = !this.open2;
        if (this.open1 && this.open2) {
            /**$(this.elemref.nativeElement).find('#div2').animate({width:'toggle'},500,function(){*/
            document.getElementById('div3').style.display = 'inline-block';
            document.getElementById('div2').style.display = 'none';
            /**});*/
            this.open1 = false;
        }
        else if (this.open2) {
            $(this.elemref.nativeElement).find('#div1').animate({ width: '50%' }, 500, function () {
                document.getElementById('div1').style.display = 'inline-block';
                document.getElementById('div3').style.display = 'inline-block';
            });
        }
        else {
            $(this.elemref.nativeElement).find('#div1').animate({ 'width': '100%' });
            document.getElementById('div3').style.display = 'none';
        }
    };
    ChatComponent.prototype.msgclick = function () {
        var msg = $(this.elemref.nativeElement).find("#btn-input").val();
        if (msg.trim() == "") {
            return;
        }
        this.socket.emit("chat message", { msg: msg });
        var htmlStr = "";
        $(this.elemref.nativeElement).find("#btn-input").val("");
        var currentdate = new Date();
        var currHr = currentdate.getHours();
        var timeStr = "AM";
        if (currHr > 12 && currHr <= 23) {
            currHr = currHr - 12;
            timeStr = "PM";
        }
        if (currHr == 0) {
            currHr = 12;
        }
        var datetime = currHr + ":"
            + currentdate.getMinutes() + " "
            + timeStr;
        var obj = document.createElement('li');
        htmlStr += "<div class='msg_container base_sent'>";
        htmlStr += "<div style='padding-right:0;'>";
        htmlStr += "<div class='messages msg_sent'>";
        htmlStr += "<p class='sender_name'>ME:</p><br/>";
        htmlStr += "<p class='msg_txt'>" + msg + "</p><br/>";
        htmlStr += "<time datetime='" + currentdate + "'> " + datetime + "</time>";
        htmlStr += "</div></div>";
        htmlStr += "<div class=' avatar' style='padding-right:0'>";
        htmlStr += "<figure class='pull-right'>";
        htmlStr += "<img style='width:70px; padding-left:10px;' src='../../images/avatar.png'>";
        htmlStr += "</figure>";
        htmlStr += "</div></div>";
        obj.innerHTML = htmlStr;
        (document.getElementById("messages")).append(obj);
        //scrolls to bottom
        var chatElem = document.getElementById("chat");
        chatElem.scrollTop = chatElem.scrollHeight;
    };
    ChatComponent.prototype.signout = function () {
        var route = this.router;
        var ajax = $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            dataType: "json",
            url: "http://" + myGlobals.IPaddress + "/api/logout",
            async: true
        }).done(function (resdata) {
            if (resdata.res) {
                console.log("truee succeeded" + resdata.res);
                localStorage.removeItem("userId");
                document.getElementById("submit").submit();
            }
            else {
                console.log("unable to logout..");
            }
        });
        ajax.fail(function (data) {
            console.log("failed" + data);
        });
    };
    ChatComponent.prototype.downloadCanvas = function () {
        var dataURL = this.canvas.toDataURL();
        var link = document.getElementById('download_canvas');
        link.href = dataURL;
        link.download = 'image';
    };
    ChatComponent.prototype.downloadFile = function () {
        var textToWrite = document.getElementById('editFile').value;
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
        var link = document.getElementById('download_file');
        if (window.webkitURL != null) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            link.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            link.href = window.URL.createObjectURL(textFileAsBlob);
        }
        link.download = 'file';
    };
    ChatComponent.prototype.updateParticipants = function () {
        var _this = this;
        console.log("active users updated..");
        var ajax = $.ajax({
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            dataType: "json",
            url: "http://" + myGlobals.IPaddress + "/api/activeUsers",
            async: true
        }).done(function (resdata) {
            if (resdata) {
                console.log("truee succeeded" + resdata);
                _this.userloggedin = [];
                $.each(resdata, function (i, val) {
                    _this.userloggedin.push(val);
                });
            }
            else {
                console.log("unable to fetch data..");
            }
        });
        ajax.fail(function (data) {
            console.log("failed" + data);
        });
    };
    return ChatComponent;
}());
ChatComponent = __decorate([
    core_1.Component({
        selector: 'app-chat',
        moduleId: module.id,
        templateUrl: 'chat.component.html',
        styleUrls: ['chat.component.css'],
        encapsulation: core_1.ViewEncapsulation.None,
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, router_1.Router])
], ChatComponent);
exports.ChatComponent = ChatComponent;
//# sourceMappingURL=chat.component.js.map