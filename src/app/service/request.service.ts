import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';
import { forEach } from '@angular/router/src/utils/collection';
import { HttpClient } from '@angular/common/http';

const hostname = environment.baseUrl;

@Injectable({
    providedIn: 'root',
})
export class RequestService {
    options;
    constructor(
        private http: HttpClient,
    ) {
      console.log('hostname',hostname);
        const headers = new Headers();
        // headers.append('Access-Control-Allow-Origin', '*');
        // headers.append('Content-Type', 'application/x-www-form-urlencoded');
        // headers.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH');
        // headers.append('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
        this.options = new RequestOptions({ headers: headers });
    }

    get(endpoint) {
        return new Promise((resolve, reject) => {
            this.http.get(hostname + endpoint, this.options)
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }

    getFile(endpoint) {
        return new Promise((resolve, reject) => {
            this.http.get(endpoint, this.options)
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }

    put(endpoint, body, headers = []) {
        if (headers.length) {
            const that = this;
            headers.forEach(function (key, val) {
                that.options.headers.set(key.key, key.name);
            });
        }
        return new Promise((resolve, reject) => {
            this.http.patch(hostname + endpoint, body, this.options)
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }

    delete(endpoint, body, headers = []) {
        if (headers.length) {
            const that = this;
            headers.forEach(function (key, val) {
                that.options.headers.set(key.key, key.name);
            });
        }
        this.options.body = body;
        return new Promise((resolve, reject) => {
            this.http.delete(hostname + endpoint, this.options)
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }

    post(endpoint, body, headers = []) {
        if (headers.length) {
            const that = this;
            headers.forEach(function (key, val) {
                that.options.headers.set(key.key, key.name);
            });
        }
        return new Promise((resolve, reject) => {
            this.http.post(hostname + endpoint, body, this.options)
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }
}
