import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  moduleId: module.id,
  templateUrl: 'app.component.html',

  /** template:'<h1>{{appName}}</h1>'*/
})
export class AppComponent {
    private appName = "Collaborative Tool";
}


