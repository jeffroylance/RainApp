import { Component } from '@angular/core';
import {Page, NavController, NavParams} from 'ionic-angular';
import {SearchPage} from '../search/search'

/*
  Generated class for the NewBatchPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/new-batch/new-batch.html',
})
export class NewBatchPage {

  public token;
  public purpose;

  constructor(public nav: NavController, public params: NavParams) {
    this.nav = nav;
    this.params = params;

    this.token = this.params.get('token');
    this.purpose = this.params.get('purpose');
  }

  push(){
    this.nav.push(SearchPage, {
      token: this.token,
      purpose: this.purpose
    })
  }

}
