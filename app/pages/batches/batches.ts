import { Component } from '@angular/core';
import {Page, NavController, Alert, NavParams} from 'ionic-angular';
import {NewBatchPage} from '../new-batch/new-batch';
import {SearchPage} from '../search/search';

/*
  Generated class for the BatchesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/batches/batches.html',
})
export class BatchesPage {

public token;
public purpose;

  constructor(public nav: NavController, public params: NavParams) {
    this.nav = nav;
    this.params = params;

    this.token = this.params.get('token');
    this.purpose = this.params.get('purpose');
  }

  newBatch(){
    this.nav.push(NewBatchPage, {
      token: this.token,
      purpose: this.purpose
    });
  }

  push(){
    this.nav.push(SearchPage, {
      token: this.token,
      purpose: this.purpose
    })
  }

  presentAlert(){
    let alert = Alert.create({
      title: 'Are You Sure?',
      message: "Once you close a batch, it can't be undone",
      buttons: [
        {
          text: 'Close Batch',
          handler: () => {
            console.log('Close Batch clicked');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    this.nav.present(alert);
  }

}

