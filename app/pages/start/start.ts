import { Component } from '@angular/core';
import {Page, NavController, Platform, NavParams, Toast} from 'ionic-angular';
import {SearchPage} from '../search/search';
import {BatchesPage} from '../batches/batches';
//import {JwtHelper} from 'angular2-jwt';

/*
  Generated class for the StartPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/start/start.html',
})
export class StartPage {
  
  //Used if you want a different interface for android and ios
  public isAndroid = false;
  public token;
  
  constructor(
    public nav: NavController,
    public params: NavParams,
    public platform: Platform
    //public jwtHelper: JwtHelper
  ) {
    this.nav = nav
    this.params = params
    this.token = this.params.get('token');
    //determines whether the device is running android or ios
    if (this.platform.is("android")){
      this.isAndroid = true;
    }
    //attempt at discovering whether the given token has expired or not (doesn't work)
    /*let alert = Toast.create({
      message: "TokenDate: " + this.jwtHelper.isTokenExpired(this.token),
      duration: 3000,
      dismissOnPageChange: true
    });
    this.nav.present(alert);*/
  }
  
  //function to run when user clicks 'take a picture' button
  picture(){
    console.log('Picture button clicked');
    this.nav.push(SearchPage, {
      token: this.token,
      //tells future pages that the user wants to take pictures
      purpose: 'picture'
    });
  }
  
  inventory(){
    console.log('Inventory button clicked');
    this.nav.push(BatchesPage, {
      token: this.token,
      //tells future pages that the user wants to edit inventory
      purpose: 'inventory'
    });
  }
  
  info(){
    console.log('Info button clicked');
    this.nav.push(SearchPage, {
      token: this.token,
      //tells future pages that the user wants to find info on the product
      purpose: 'info'
    });
  }
  
  logOut(){
    console.log('Logged Out')
    this.nav.popToRoot();
  }
  
}

