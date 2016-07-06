import { Component } from '@angular/core';
import {Page, NavController, Toast, Alert} from 'ionic-angular';
import {Keyboard} from 'ionic-native'

/*
  Generated class for the TestPagePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/test-page/test-page.html',
})
export class TestPagePage {

  public inventory: number = 72;
  public originalInventory = 72;
  public showSearch=false;
  public submit = false;
  public submit2 = false;
  public input;
  public measurement = "";

  constructor(public nav: NavController) {}

  add(){
    this.inventory -= 1;
    this.inventory += 2;
  }

  subtract(){
    this.inventory -= 1
  }

  saveInventory(){
    this.originalInventory = this.inventory
    let alert = Toast.create({
      message: 'Inventory Updated!',
      duration: 3000
      //dismissOnPageChange: true
    });
    this.nav.present(alert);
  }

  closeKeyboard(){
    if(this.inventory == 0){
      this.inventory = 0;
    }
    Keyboard.close();
    this.inventory -= 1;
    this.inventory += 1;
  }

  checkZero(){
    if(this.inventory == 0){
      this.inventory = 0
    }
  }

  showSearchBar(){
    if (this.showSearch == false){
      this.showSearch = true;
      if (this.submit2 == true){
        this.submit = true;
        this.submit2 = false;
      }
    } else {
      this.showSearch = false;
      if(this.submit == true){
        this.submit = false;
        this.submit2 = true;
      }
    }
  }

  showButton(event){
    if(event.target.value.length > 2){
      this.submit = true;
    } else {
      if (event.target.value.length <= 0){
        this.submit=false;
      }
    }
  }

  cancel(){
    this.inventory = this.originalInventory
  }

  presentAlert(){
    let alert = Alert.create({
      title: 'Warning',
      message: "This product has already been inventoried in this Batch. Do you wish for this amount to be added to the current inventory or replace it??",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Show History',
          handler: () => {
            console.log('History clicked');
          }
        },
        {
          text: 'Replace',
          handler: () => {
            console.log('Replace clicked');
            this.saveInventory();
          }
        },
        {
          text: 'Add',
          handler: () => {
            console.log('Add clicked');
            this.saveInventory();
          }
        }
      ]
    });
    this.nav.present(alert);
  }
}

