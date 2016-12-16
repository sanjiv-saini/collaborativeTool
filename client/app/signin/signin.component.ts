import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import myGlobals = require('../globals');
declare var $: any;



@Component({
  selector: 'app-signin',
  moduleId: module.id,
  templateUrl: 'signin.component.html',
  styleUrls: ['signin.component.css'],
})

export class SigninComponent implements OnInit {

  title = 'Collaborative Tool Application!';
  constructor(public router: Router) {
  }

  ngOnInit() {

    if (localStorage.getItem("userId")) {
      console.log("inside localstorage");
      this.router.navigate(['/chatting']);
    }

    var vid = <HTMLVideoElement>document.getElementById("background");
    function vidFade() {
      vid.classList.add("stopfade");
    }

    vid.addEventListener('ended', function () {
      vid.pause();
      vidFade();
    });

  }

  hideError(){
    document.getElementById("wrongUser").style.display = "none";
  }

  onSubmit() {
    console.log("inside onsubmit");
    var route = this.router;
    var user = (<HTMLInputElement>document.getElementById('uname')).value;
    var pass = (<HTMLInputElement>document.getElementById('passval')).value;
    console.log("user: " + user + " password: " + pass);
    console.log(JSON.stringify({ loginname: user, password: pass }));
    var ajax = $.ajax({
      type: "POST",
      crossDomain: true,
      data: { loginname: user, password: pass },
      contentType: "application/x-www-form-urlencoded",
      dataType: "json",
      url: "http://"+myGlobals.IPaddress+"/api/login",
      async: true
    }).done(function (resdata) {
      if (resdata.res) {
        console.log("truee succeeded" + resdata.res);
        localStorage.setItem("userId", user);
        route.navigate(['/chatting']);
      }
      else {
        console.log("wrong username and password");
        document.getElementById("wrongUser").style.display= "inline";
      }
    });
    ajax.fail(function (data) {
      console.log("failed" + data);
    });
  }
}
