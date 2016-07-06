//importing angular2 resources
import { Component } from '@angular/core';
import {Page, Storage, SqlStorage, Alert, Toast, Loading, NavController} from 'ionic-angular';
import {SearchPage} from '../search/search';
import {StartPage} from '../start/start';
import {TestPagePage} from '../test-page/test-page';
import {BatchesPage} from '../batches/batches';
import {Http, Headers} from '@angular/http';
import {BarcodeScanner} from 'ionic-native';
//import {JwtHelper} from 'angular2-jwt';
import 'rxjs/Rx';


@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  
  static get parameters() {
    return [[Http],[NavController]];
  }
  
  //initializing variables
  
  //the url used for Rain API's
  LOGIN_URL: String = 'https://api.rainpos.com/';//'https://api.onyxstaging.com/api/';
  public store = {token: null};
  public errorString;
  public status = {error: null};
  public array = [];
  public credentials = {username: "", password: ""};
  public local;
  public token;
  public rememberMe = true;
  public inventory = 72;
  public originalInventory = 72;
  
  
  constructor(
      private http: Http,
      public nav: NavController,
      public bcScanner: BarcodeScanner
      //public jwtHelper: JwtHelper
    ) {
    this.http = http;
    this.local = new Storage(SqlStorage);
    this.nav = nav;
    //this.jwtHelper = jwtHelper;
    
    //fetch username and password from storage (if the user previously requested the app to 'remember me')
    this.local.get('username').then((username) => {
      if (username != null){
        this.credentials.username = username;
      }
    });
    this.local.get('password').then((password) => {
      if (password != null){
        this.credentials.password = password;
      }
    });
    
    
  }
  
  add(){
    this.inventory = this.inventory + 1
  }

  subtract(){
    this.inventory = this.inventory - 1
  }

  saveInventory(){
    this.originalInventory = this.inventory
  }

  testNav(){
    this.nav.push(TestPagePage);
  }

  batchesNav(){
    this.nav.push(BatchesPage);
  }

  login(){
    
      //create a loading spinner that will dismiss itself when the page changes
      let loading = Loading.create({
        content: 'Please wait...',
        dismissOnPageChange: true
      });
      this.nav.present(loading);
      
      //access the API via an http POST
      var headers = new Headers();
        headers.append('Content-Type', 'application/json');
      this.http.post(this.LOGIN_URL + 'auth', '{"username":"' + this.credentials.username + '", "password":"' + this.credentials.password + '"}', {headers: headers})
      .map(
        res => res.json()
      )
      .subscribe(
        data => {
          //set the token recieved to a variable
          if (JSON.stringify(data).indexOf('ERROR 2203:') != -1){
            loading.dismiss();
            this.errorString = JSON.stringify(data);
            console.log('errorString: ' + this.errorString);
            
            //if the username or password was wrong, alert the user
            console.log('indexOf errorString: ' + this.errorString.indexOf('error":"ERROR 2203: '))
            if (this.errorString.indexOf('error":"ERROR 2203: ') != -1){
              this.status.error = this.errorString.substring(this.errorString.indexOf('error":"ERROR 2203: ') + 20, this.errorString.indexOf('."}'));
              console.log('error: ' + this.status.error); 
              loading.dismiss();
              setTimeout(() => {
                let alert = Toast.create({
                  message: this.status.error,
                  duration: 3000,
                  dismissOnPageChange: true
                });
                this.nav.present(alert);
                
              }, 600)
            }

          }else{

            this.store.token = data.token,
            console.log('JSON: ' + JSON.stringify(data))
            
            //store users data if they click remember me, otherwise delete
            if (this.rememberMe == true) {
              this.local.set('username', this.credentials.username);
              this.local.set('password', this.credentials.password);
            } else {
              this.local.get('username').then((username) => {
                if (username != null){
                  if (username == this.credentials.username){
                    this.local.get('password').then((password) => {
                      if (password != null){
                        if (password == this.credentials.password){
                          this.local.remove('username');
                          this.local.remove('password');
                        }
                      }
                    });
                    
                  }
                }
              });
            }
            
            //navigate to the next page
            this.nav.push(SearchPage, {
              token: this.store.token,
              purpose: 'picture'
            });
          }
        },
        //error handling
        err => {
          
          //dismiss loading spinner
          loading.dismiss();
          
          //log error 
          this.errorString = JSON.stringify(err);
          console.log('errorString: ' + this.errorString);
          
          //if the username or password was wrong, alert the user
          if (this.errorString.indexOf('error\\":\\"ERROR 2203: ') != -1){
            this.status.error = this.errorString.substring(this.errorString.indexOf('error\\":\\"ERROR 2203: ') + 22, this.errorString.indexOf('.\\"}","status":401'));
            console.log('error: ' + this.status.error); 
            loading.dismiss();
            setTimeout(() => {
              let alert = Toast.create({
                message: this.status.error,
                duration: 3000,
                dismissOnPageChange: true
              });
              this.nav.present(alert);
              
            }, 600)
          }
        }
      );
  }
}