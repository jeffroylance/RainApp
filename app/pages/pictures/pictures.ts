import { Component } from '@angular/core';
import {Page, NavController, Toast, Alert, NavParams, Modal, ViewController} from 'ionic-angular';
import {Camera, BarcodeScanner} from 'ionic-native';
import {SearchPage} from '../search/search';
import {Http, Headers} from '@angular/http';
/*
  Generated class for the PicturesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  templateUrl: 'build/pages/pictures/pictures.html',
})
export class PicturesPage {
  static get parameters() {
    return [[NavController],[NavParams],[Http]];
  }
  
  //INITIALIZE ALL PUBLIC VARIABLES
  public token;
  public productTitle;
  public productId;
  public productImage = [];
  public productImageArray;
  public editedImage;
  public base64;
  public inventory = 72;
  
  //API URL
  public URL = 'https://api.rainpos.com/'; //"http://api.onyxstaging.com/api/";
  
  public width = window.innerWidth * 40 / 100;
  
  //Used to change interface to acommodate search bar
  public showSearch=false;
  public submit = false;
  public submit2 = false;
  
  public input;
  public purpose;
  
  constructor( public nav: NavController, public params: NavParams, public http: Http, public searchPage: SearchPage, public view: ViewController ) {
    this.nav = nav;
    this.params = params;
    this.http = http;
    this.searchPage = searchPage;
    
    //obtain token, product images, and the users purpose (pictures, inventory, or info)
    this.purpose = this.params.get('purpose');
    this.token = this.params.get("token");
    this.productId = this.params.get("ProductId");
    this.productTitle = this.params.get("ProductTitle");
    this.productImageArray = this.params.get("ProductImage");
    
    //format product images into an array of source urls
    if (this.productImageArray.constructor === Array){
      if (/^.*\.[^\\]+$/.test(this.productImageArray[0])) {
        this.productImageArray.forEach( image => {
          this.editedImage = image;
          this.productImage.push("http://siterepository.s3.amazonaws.com/" + this.editedImage.replace("\\\\", ""));
        });
      }
    }
    else{
      this.productImage.push("http://siterepository.s3.amazonaws.com/" + this.productImageArray.replace("\\\\", ""));
      
    }
    
    
  }

  add(){
    this.inventory = this.inventory + 1
  }

  subtract(){
    this.inventory = this.inventory - 1
  }
  
  camera() {
    //take picture
    console.log('Picture Button Clicked');
    console.log(this.URL + "product/" +  this.productId + "/image")
    Camera.getPicture({
      quality: 50,
      destinationType: 0,
      targetWidth: 700,
      targetHeight: 700,
      allowEdit: true,
      correctOrientation: true
    }).then((imageData) => {
      let base64Image = "data:image/jpeg;base64," + imageData;
      this.base64 = base64Image;
      
      //upload picture
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this.token);
      console.log('{"headers": ' + JSON.stringify(headers) + '}')
      this.http.post(this.URL + "product/" +  this.productId + "/image/" , '{"image":"' + this.base64 + '"}', {"headers": headers} )
      .map(
        res => res.json()
      )
      .subscribe(
        data => {
          //update interface with new image
          this.productImage.push(JSON.stringify(data).substring(JSON.stringify(data).indexOf('https'), JSON.stringify(data).indexOf('","')))
        },
        err => {
          console.log(JSON.stringify(err));
          let alert = Toast.create({
          message: JSON.stringify(err),
          duration: 3000,
          dismissOnPageChange: true
      });
      this.nav.present(alert);
        }
      )
    }, (err) => {
      console.log(err.text);
      let alert = Toast.create({
        message: "Oops, we didn't quite get that",
        duration: 3000,
        dismissOnPageChange: true
      });
      this.nav.present(alert);
    });
  }
  
  remove(number){
    //prompt user to remove image
    let alert = Alert.create({
        title: "Are you sure?",
        message: "If you remove this image, it's gone forever",
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: "I'm sure",
            handler: () => {
              this.remove2(number);
            }
          }
        ]
      });
      this.nav.present(alert);
  }
    
   remove2(number){ 
     // tell the server to remove selected image
      var headers = new Headers();
      headers.append('Authorization', 'Bearer ' + this.token);
      this.http.post(this.URL + "product/" +  this.productId + "/removeImage" , '{"imageUrl":"' + this.productImage[number] + '"}', {"headers": headers} )
      .map(
        res => res.json()
      )
      .subscribe(
        data => {
          //update interface without the image
          this.productImage.splice(number, 1);
        },
        err => {
          console.log(JSON.stringify(err));
        }
      )
  }
  
  
  
  
  
  // the following functions update the interface when the appropriate buttons are clicked to allow 
  // barcode scanning and searching for other products
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
  
  search(){
    this.nav.push(SearchPage, {
      token: this.token,
      passedInput: this.input,
      purpose: this.purpose
    });
  }
  
  scan(){
    BarcodeScanner.scan().then((barcodeData) => {
        this.nav.push(SearchPage, {
          token: this.token,
          barcode: barcodeData.text
        })
        
    }, 
    (err) => {
      let alert = Toast.create({
        message: "Oops, we didn't quite get that",
        duration: 3000,
        dismissOnPageChange: true
      });
      this.nav.present(alert);

    });
  }
  
  find(value){
    if (value != null && value != "") {
      this.submit = true;
    } else {
      this.submit = false;
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
}
