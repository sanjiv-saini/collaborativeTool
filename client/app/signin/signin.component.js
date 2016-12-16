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
var SigninComponent = (function () {
    function SigninComponent(router) {
        this.router = router;
        this.title = 'Collaborative Tool Application!';
    }
    SigninComponent.prototype.ngOnInit = function () {
        if (localStorage.getItem("userId")) {
            console.log("inside localstorage");
            this.router.navigate(['/chatting']);
        }
        var vid = document.getElementById("background");
        function vidFade() {
            vid.classList.add("stopfade");
        }
        vid.addEventListener('ended', function () {
            vid.pause();
            vidFade();
        });
    };
    SigninComponent.prototype.hideError = function () {
        document.getElementById("wrongUser").style.display = "none";
    };
    SigninComponent.prototype.onSubmit = function () {
        console.log("inside onsubmit");
        var route = this.router;
        var user = document.getElementById('uname').value;
        var pass = document.getElementById('passval').value;
        console.log("user: " + user + " password: " + pass);
        console.log(JSON.stringify({ loginname: user, password: pass }));
        var ajax = $.ajax({
            type: "POST",
            crossDomain: true,
            data: { loginname: user, password: pass },
            contentType: "application/x-www-form-urlencoded",
            dataType: "json",
            url: "http://" + myGlobals.IPaddress + "/api/login",
            async: true
        }).done(function (resdata) {
            if (resdata.res) {
                console.log("truee succeeded" + resdata.res);
                localStorage.setItem("userId", user);
                route.navigate(['/chatting']);
            }
            else {
                console.log("wrong username and password");
                document.getElementById("wrongUser").style.display = "inline";
            }
        });
        ajax.fail(function (data) {
            console.log("failed" + data);
        });
    };
    return SigninComponent;
}());
SigninComponent = __decorate([
    core_1.Component({
        selector: 'app-signin',
        moduleId: module.id,
        templateUrl: 'signin.component.html',
        styleUrls: ['signin.component.css'],
    }),
    __metadata("design:paramtypes", [router_1.Router])
], SigninComponent);
exports.SigninComponent = SigninComponent;
//# sourceMappingURL=signin.component.js.map