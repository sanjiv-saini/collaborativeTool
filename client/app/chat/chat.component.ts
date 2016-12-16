import { Component, OnInit, ElementRef, ViewEncapsulation, EventEmitter, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import myGlobals = require('../globals');

declare var $: any;
declare var io: any;

@Component({
    selector: 'app-chat',
    moduleId: module.id,
    templateUrl: 'chat.component.html',
    styleUrls: ['chat.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ChatComponent implements OnInit, AfterViewInit {
    userloggedin: string[] = [];
    chatCaption: string;
    socket = io.connect("http://" + myGlobals.IPaddress);
    paint: boolean;
    color: string;
    canvas: HTMLCanvasElement;
    canvas2: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    ctx2: CanvasRenderingContext2D
    mousePos: {};
    prevMousePos: {};
    lineWidth: number;

    startmouseX: number;
    startmouseY: number;
    /**  --------------------shapes draw code----------------------------*/
    pencil: boolean = true;
    eraser: boolean = false;
    line: boolean = false;
    circle: boolean = false;
    rectangle: boolean = false;
    /**---------------------------------------------------------------------*/

    constructor(public elemref: ElementRef, public router: Router) {

    }

    ngAfterViewInit() {
        this.canvas = <HTMLCanvasElement>document.getElementById('drawing');
        this.canvas2 = <HTMLCanvasElement>document.getElementById('tmp_drawing');
        this.ctx2 = this.canvas2.getContext("2d");
        this.ctx = this.canvas.getContext("2d");
        this.color = "#000000";
        this.paint = false;
        this.lineWidth = 2;
        $('#tmp_drawing').css('cursor', "url('images/pencil_cursor.cur') 5 5, pointer");
    }



    private onMouseButtonUp(e: MouseEvent) {

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
    }


    makeMouseButtonUp(shape: string, line: any, color: string) {

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
    }

    private onMouseOut(event: MouseEvent) {
        this.paint = false;
    }


    private onMouseMove(e: MouseEvent) {

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

    }

    makeMouseMove(shape: string, line: any, color: string) {

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

    }



    private onMouseButtonDown(e: MouseEvent) {

        var mouseX = e.pageX - this.canvas2.offsetLeft;
        var mouseY = e.pageY - this.canvas2.offsetTop;
        this.paint = true;
        this.startmouseX = mouseX;
        this.startmouseY = mouseY;

    }


    private onKeyPress(event: KeyboardEvent) {
        console.log("filedata emitting");
        this.socket.emit('file_data', { para: (<HTMLInputElement>document.getElementById('editFile')).value });
    }

    private onKeyEnter(event: KeyboardEvent) {
        if((<HTMLInputElement>document.getElementById('btn-input')).value.trim() == ""){
            document.getElementById("btn-chat1").disabled = true;
        }
        else{
            document.getElementById("btn-chat1").disabled = false;
            var key = event.which;
            if (key == 13) {
                this.msgclick();
            }
        }
        
    }
    /**-------------------------------new canvas drawing feat---------------------------------------------*/

    onPaintLine(x: number, y: number) {
        var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: x, y: y }];
        this.EmitDrawData(line, "line", this.paint, this.color);
    }

    drawPaintLine(line: any, color: string) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);

        this.ctx2.beginPath();
        this.ctx2.moveTo(line[0].x, line[0].y);
        this.ctx2.lineTo(line[1].x, line[1].y);
        this.ctx2.strokeStyle = color;
        this.ctx2.stroke();
        this.ctx2.closePath();
    }


    onPaintRectangle(x: number, y: number) {
        var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: x, y: y }];
        this.EmitDrawData(line, "rectangle", this.paint, this.color);
    }

    drawPaintRectangle(line: any, color: string) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);

        this.ctx2.beginPath();
        this.ctx2.moveTo(line[0].x, line[0].y);

        var a = Math.min(line[1].x, line[0].x);
        var b = Math.min(line[1].y, line[0].y);
        var width = Math.abs(line[1].x - line[0].x);
        var height = Math.abs(line[1].y - line[0].y);
        this.ctx2.strokeStyle = color;
        this.ctx2.strokeRect(a, b, width, height);

    }


    onPaintCircle(x: number, y: number) {
        var line = [{ x: this.startmouseX, y: this.startmouseY }, { x: x, y: y }];
        this.EmitDrawData(line, "circle", this.paint, this.color);
    }


    drawPaintCircle(line: any, color: string) {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
        var a = (line[1].x + line[0].x) / 2;
        var b = (line[1].y + line[0].y) / 2;
        var radius = Math.max(Math.abs(line[1].x - line[0].x), Math.abs(line[1].y - line[0].y)) / 2;
        this.ctx2.beginPath();
        this.ctx2.arc(a, b, radius, 0, Math.PI * 2, false);
        this.ctx2.strokeStyle = color;
        this.ctx2.stroke();
        this.ctx2.closePath();
    }



    /**--------------------------------------------------------------------------------*/


    //line is coordinates 
    EmitDrawData(line: any, shape: string, temp: boolean, color: string) {
        var obj = {
            'line': line,
            'shape': shape,
            'temp': temp,
            'color': color
        };
        this.socket.emit("draw_shape", obj);
    }



    setCanvasSize() {

        if (this.open1) {
            var canParElem = document.getElementById("canvasParent");

            this.canvas.width = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("width"), 10);
            this.canvas.height = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("height"), 10);
            this.ctx = this.canvas.getContext("2d");

            this.canvas2.width = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("width"), 10);
            this.canvas2.height = parseInt(window.getComputedStyle(canParElem, null).getPropertyValue("height"), 10);
            this.ctx2 = this.canvas2.getContext("2d");

            $("#tmp_drawing").offset({ top: this.canvas.offsetTop, left: this.canvas.offsetLeft })

            this.socket.emit("draw_history");
        }
    }


    ngOnInit() {

        var route = this.router;
        this.socket.on('connect', function () {
            console.log("user connected");

        });
        this.socket.on('set_title', (userName) => {
            this.chatCaption = userName;
        });
        this.socket.on('redirect', () => {
            console.log("oops!!server Restarts....");
            localStorage.removeItem("userId");
            document.getElementById("submit").submit(); 
            //route.navigate(['/login']);

        });
        this.socket.on('history', (line_history, file_data) => {
            for (var i in line_history) {
                console.log("history received to new user" + line_history[i]);
                var data = line_history[i];
                this.ctx.beginPath();
                this.ctx.lineWidth = this.lineWidth;
                if (data.shape == "line" || data.shape == "pencil" || data.shape == "eraser") {
                    this.ctx.moveTo(data.line[0].x, data.line[0].y);

                    this.ctx.lineTo(data.line[1].x, data.line[1].y);
                    this.ctx.stroke();
                }

                else if (data.shape == "rectangle") {
                    this.ctx.moveTo(data.line[0].x, data.line[0].y);

                    var a = Math.min(data.line[1].x, data.line[0].x);
                    var b = Math.min(data.line[1].y, data.line[0].y);
                    var width = Math.abs(data.line[1].x - data.line[0].x);
                    var height = Math.abs(data.line[1].y - data.line[0].y);
                    this.ctx.strokeRect(a, b, width, height);
                }

                else if (data.shape == "circle") {
                    var a = (data.line[1].x + data.line[0].x) / 2;
                    var b = (data.line[1].y + data.line[0].y) / 2;
                    var radius = Math.max(Math.abs(data.line[1].x - data.line[0].x), Math.abs(data.line[1].y - data.line[0].y) / 2);
                    this.ctx.arc(a, b, radius, 0, Math.PI * 2, false);
                    this.ctx.stroke();
                }
            }
            (<HTMLInputElement>document.getElementById('editFile')).value = file_data;
        });

        /**------------------drag and drop code -------------------------*/

        var dropZone = document.getElementById('editFile');
        dropZone.addEventListener('dragover', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

        }, false);
        dropZone.addEventListener('drop', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer.files; // FileList object.
            var reader = new FileReader();
            var socket = this.socket;
            reader.onload = function (event) {
                (<HTMLInputElement>document.getElementById('editFile')).value = event.target.result;
                socket.emit('file_data', { para: event.target.result });
            }
            reader.readAsText(files[0], "UTF-8");
        }, false);

        /**-----------------------------------------------------------*/

        $("#eraser").click(() => {
            this.pencil = false;
            this.eraser = true;
            this.line = false;
            this.circle = false;
            this.rectangle = false;
            $('#tmp_drawing').css('cursor', "url('images/eraser_cursor.cur') 5 5, pointer");
            $("#pencil").removeClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").addClass('clicked');
        });

        $("#pencil").click(() => {
            this.pencil = true;
            this.eraser = false;
            this.line = false;
            this.circle = false;
            this.rectangle = false;
            $('#tmp_drawing').css('cursor', "url('images/pencil_cursor.cur') 5 5, pointer");
            $("#pencil").addClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").removeClass('clicked');
        });

        $("#circle").click(() => {
            this.pencil = false;
            this.eraser = false;
            this.line = false;
            this.circle = true;
            this.rectangle = false;
            $('#tmp_drawing').css('cursor', "crosshair");
            $("#pencil").removeClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").addClass('clicked');
            $("#eraser").removeClass('clicked');
        });


        $("#clearCanvas").click(() => {
            this.ctx.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
            this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
            this.socket.emit("clear_canvas");
        });
        $("#clearEditor").click(() => {
            (<HTMLInputElement>document.getElementById('editFile')).value = '';
            this.socket.emit("clear_file");
        });

        this.socket.on("clear_canvas", () => {
            this.ctx.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
            this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
        });
        this.socket.on("clear_file", () => {
             (<HTMLInputElement>document.getElementById('editFile')).value = '';
        });

        $("#line").click(() => {
            this.pencil = false;
            this.eraser = false;
            this.line = true;
            this.circle = false;
            this.rectangle = false;
            $('#tmp_drawing').css('cursor', "crosshair");
            $("#pencil").removeClass('clicked');
            $("#line").addClass('clicked');
            $("#rectangle").removeClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").removeClass('clicked');
        });

        $("#rectangle").click(() => {
            this.pencil = false;
            this.eraser = false;
            this.line = false;
            this.circle = false;
            this.rectangle = true;
            $('#tmp_drawing').css('cursor', "crosshair");
            $("#pencil").removeClass('clicked');
            $("#line").removeClass('clicked');
            $("#rectangle").addClass('clicked');
            $("#circle").removeClass('clicked');
            $("#eraser").removeClass('clicked');
        });

        window.addEventListener('resize', this.setCanvasSize);

        $(window).resize(() => {
            this.setCanvasSize();
        });

        this.socket.on('updated_file', function (data) {
            (<HTMLInputElement>document.getElementById('editFile')).value = data;
        });

        this.socket.on('draw_shape', (data) => {
            console.log("draw shape");
            if (data.temp) {
                this.makeMouseMove(data.shape, data.line, data.color);

            } else {
                this.makeMouseButtonUp(data.shape, data.line, data.color);
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
            var htmlStr: string = "";
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

    }

    change() {
        this.color = (<HTMLInputElement>document.getElementById('color')).value;
        document.getElementById('drawing').style.cursor = "url('images/pencil.png') 0 52, pointer";
    }

    open1: boolean = false;
    open2: boolean = false;

    Onclick1() {
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

            $(this.elemref.nativeElement).find('#div1').animate({ width: '50%' }, 500, () => {
                document.getElementById('div1').style.display = 'inline-block';

                document.getElementById('div2').style.display = 'inline-block';

                this.setCanvasSize();
            });

        } else {

            $(this.elemref.nativeElement).find('#div1').animate({ 'width': '100%' });
            document.getElementById('div2').style.display = 'none';

        }

    }

    Onclick2() {
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
        } else {


            $(this.elemref.nativeElement).find('#div1').animate({ 'width': '100%' });
            document.getElementById('div3').style.display = 'none';

        }

    }

    msgclick() {
        var msg = $(this.elemref.nativeElement).find("#btn-input").val();
        if(msg.trim() == ""){
            return;
        }
        this.socket.emit("chat message", { msg: msg });

        var htmlStr: string = "";
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

    }
    signout() {
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
                //route.navigate(['/login']);
            }
            else {
                console.log("unable to logout..");
            }
        });
        ajax.fail(function (data) {
            console.log("failed" + data);
        });
    }
    downloadCanvas() {
        var dataURL = this.canvas.toDataURL();
        var link = <HTMLInputElement>document.getElementById('download_canvas');
        link.href = dataURL;
        link.download = 'image';
    }
    downloadFile() {
        var textToWrite = (<HTMLInputElement>document.getElementById('editFile')).value;
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
        var link = <HTMLInputElement>document.getElementById('download_file');
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
    }
    updateParticipants() {
        console.log("active users updated..");
        var ajax = $.ajax({
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            dataType: "json",
            url: "http://" + myGlobals.IPaddress + "/api/activeUsers",
            async: true
        }).done((resdata) => {
            if (resdata) {
                console.log("truee succeeded" + resdata);
                this.userloggedin = [];
                $.each(resdata, (i, val) => {
                    this.userloggedin.push(val);
                });

            }
            else {
                console.log("unable to fetch data..");
            }
        });
        ajax.fail(function (data) {
            console.log("failed" + data);
        });

    }

}


