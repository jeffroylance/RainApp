import { Component } from '@angular/core';
import {Platform, Page, Storage, SqlStorage, Alert, Toast, NavController, Loading, NavParams} from 'ionic-angular';
import {PicturesPage} from '../pictures/pictures';
import {HomePage} from '../home/home';
import {TestPagePage} from '../test-page/test-page';
import {Http, Headers} from '@angular/http';
import {BarcodeScanner, Keyboard} from 'ionic-native';
//import {JwtHelper} from 'angular2-jwt'
import 'rxjs/Rx';

/*
  Generated class for the SearchPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/search/search.html',
})
export class SearchPage {
  static get parameters() {
    return [[NavController],[NavParams],[Http],[Platform]];
  }
  
  //INITIALIZE ALL PUBLIC VARIABLES
  //used for changing the interface based on the platform
  public isAndroid = false;
  
  //the users input in the search field
  public input = "";
  public input2;
  
  //arrays to contain products recieved from the API
  public titleArray;
  public imageArray;
  public idArray;
  public productTitle = [];
  public productImage = [];
  public productId = [];
  
  
  public token;
  public products;
  
  // the api's url
  public URL = 'https://api.rainpos.com/'; //"http://api.onyxstaging.com/api/";
  
  //Used by the authorization process
  public headers = new Headers;
  
  public product;
  public status = {error: null};
  public submit = false;
  
  //Used to help organize the arrays of products, id's and images
  public counter;
  public counter2;
  
  
  public barcode = null;
  public cameBack = false;
  public passedInput = null;
  public local;
  public purpose;



  constructor(
    
    public nav: NavController,
    public params: NavParams,
    private http: Http,
    public platform: Platform,
    public bcScanner: BarcodeScanner
    
    ) {
     
    //put resources into variables  
    this.nav = nav;
    this.params = params;
    this.local = new Storage(SqlStorage);
    this.bcScanner = bcScanner;
    this.http = http;
    this.platform = platform;
    
    //get token
    this.token = this.params.get('token');
    console.log(this.token);

    
    //find out what the user wants to do (Picture, Inventory, or Info)
    this.purpose = this.params.get('purpose');
   
   
    //Determine whether the device is running Android or Ios
    if (this.platform.is("android")){
      this.isAndroid = true;
    }
    
    //find products based on searches from the (pictures?) page
    this.passedInput = this.params.get("passedInput");
    if (this.passedInput){
      this.input = this.passedInput;
      this.request(this.passedInput);
    }
    this.barcode = this.params.get("barcode");
    if (this.barcode){
      this.request(this.barcode);
    }
  }
  
  
  //Remove all results and move to next page
  nextPage(number) {
    this.input2 = this.input;
    this.titleArray = this.productTitle;
    this.imageArray = this.productImage;
    this.idArray = this.productId;
    
    this.input = "";
    this.productTitle = [];
    this.productImage = [];
    this.productId = [];
    
    this.nav.push(PicturesPage, {
      ProductTitle: this.titleArray[number],
      ProductImage: this.imageArray[number],
      ProductId: this.idArray[number],
      token: this.token,
      purpose: this.purpose
    });
  }
  
  
  //Change interface when user types into the input field (as opposed to just clicking the 'scan barcode' button)
  search(event){
    
    if(event.target.value.length > 2){
      this.find(event.target.value);
    }
  }
  
  
  
  scan(){
    BarcodeScanner.scan().then((barcodeData) => {
        this.input = "";
        this.submit = false;
        this.productTitle = [];
        this.productImage = [];
        this.request(barcodeData.text);
    }, 
    (err) => {
      //Gives an error toast if the user exits the barcode scanner before it has scanned anything
      let alert = Toast.create({
        message: err,
        duration: 3000,
        dismissOnPageChange: true
      });
      this.nav.present(alert);
    });
  }
  
  
  request(value){
    /*if (this.purpose = 'inventory'){
      this.nav.push(TestPagePage);
    }*/
    //HTTP Request to API
    var headers = new Headers();
        headers.append('Authorization', 'Bearer ' + this.token);
        console.log('token: ' + this.token);
        console.log(this.URL + "product/search?term=" + value, {"headers": headers});
        this.http.get( this.URL + "product/search?term=" + value, {"headers": headers})
            .subscribe(
                data => {
                  this.productTitle = [];
                  this.productImage = [];
                  this.product = JSON.stringify(data);
                  
                  //identify individual products, images and ids in the returned string
                  this.products = this.product.split('{\\"product_id');
                  if (this.product.indexOf('title\\":\\"') == -1){
                    let alert = Toast.create({
                      message: "We couldn't find any items matching '" + value + "'",
                      duration: 3000,
                      dismissOnPageChange: true
                    });
                    this.nav.present(alert);
                  }
                  
                  //organize results into arrays
                  this.products.forEach(element => {
                    console.log(element);
                    if (element.indexOf('title\\":\\"') != -1){
                      this.productId.push(element.substring(5, element.indexOf('\\",\\"title')));
                      this.productTitle.push(element.substring(element.indexOf('title\\":\\"') + 10, element.indexOf('\\",\\"show_price')));
                      this.productImage.push(element.substring(element.indexOf('general_images\\":[\\"') + 20, element.indexOf('\\"],\\"options')).split(/,|\\",\\"/));
                    }
                    Keyboard.close();
                    
                    //log results of search
                    this.counter = 0;
                    this.counter2 = 0;
                    this.productId.forEach( id => {
                      console.log('productId[' + this.counter + ']: ' + id);
                      this.counter++;
                    });
                    this.counter = 0;
                    this.counter2 = 0;
                    this.productTitle.forEach( title => {
                      console.log('productTitle[' + this.counter + ']: ' + title);
                      this.counter++;
                    });
                    this.counter = 0;
                    this.counter2 = 0;
                    this.productImage.forEach( imageArray => {
                      imageArray.forEach( image => {
                        console.log('productImage[' + this.counter2 + '][' + this.counter + ']: ' + image);
                        this.counter++;
                      })
                      this.counter=0;
                      this.counter2++;
                    });
                    
                  });
                  
                  //if the search was initiated from the (pictures?) page, prompt user to go to next page with the first item in the array
                  if (this.passedInput || this.barcode){
                    setTimeout( () => {
                      if(this.productTitle.length == 1){
                        let alert = Alert.create({
                          subTitle: this.productTitle[0],
                          buttons: [
                            {
                              text: 'Cancel',
                              handler: data => {
                                console.log('Cancel clicked');
                              }
                            },
                            {
                              text: 'Ok',
                              handler: data => {
                                this.nextPage(0);
                              }
                            }
                          ]
                        });
                        this.nav.present(alert);
                      
                      }
                    }, 800)
                  }else{
                    //if there is only one matching item, prompt user to go to next page
                    if(this.productTitle.length == 1){
                        let alert = Alert.create({
                          subTitle: this.productTitle[0],
                          buttons: [
                            {
                              text: 'Cancel',
                              handler: data => {
                                console.log('Cancel clicked');
                              }
                            },
                            {
                              text: 'Ok',
                              handler: data => {
                                this.nextPage(0);
                              }
                            }
                          ]
                        });
                        this.nav.present(alert);
                      
                      }
                  }
                },
                err => {
                  //error handling
                  Keyboard.close();
                  if (value != '' && value != null){
                    let alert = Toast.create({
                      message: "We're sorry, but we couldn't find any items matching '" + this.input + "'",
                      duration: 3000,
                      dismissOnPageChange: false
                    });
                    this.nav.present(alert);
                  }
                  else{
                    
                    let alert = Toast.create({
                      message: "Oops, we didn't quite get that",
                      duration: 5000,
                      dismissOnPageChange: true
                    });
                    this.nav.present(alert);
                  }
                }
            );
  }
  
  
  //Used to change interface when the user types in the search field
  find(value){
    if (value != null && value != "") {
      this.submit = true;
    } else {
      this.submit = false;
    }
  }
  
  findStage2(){
    this.request(this.input);
    this.submit = false;
  }
  
  goHome(){
    if (this.purpose == 'inventory'){
      let alert = Alert.create({
        title: 'Is this batch complete?',
        message: "If you would like to resume this batch at a later time, please select 'Continue Later', if you would like to finish it, select 'Close Batch'",
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Close Batch',
            handler: () => {
              this.alert2();
            }
          },
          {
            text: 'Continue Later',
            handler: () => { 
              this.nav.rootNav.pop().then(() => {
                 this.nav.rootNav.pop(); 
              }); 
            } 
          }
        ]
      });
    this.nav.present(alert);
    }
    else{
      this.nav.pop();
    }
  }

  alert2(){
    let alert = Alert.create({
        title: 'Are you sure?',
        message: "Once you close a batch, it can't be undone",
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Close Batch',
            handler: () => { 
              this.nav.rootNav.pop().then(() => {
                 this.nav.rootNav.pop(); 
              }); 
            } 
          }
        ]
      });
    this.nav.present(alert);
  }

  pop(){
    this.nav.popToRoot();
  }
}
