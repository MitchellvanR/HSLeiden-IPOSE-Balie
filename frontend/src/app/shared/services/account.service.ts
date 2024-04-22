import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Account } from '../models/account.model';
import { environment } from '../../../environments/environment';
import { ReviewService } from './review.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
    account: Account = new Account(-1, '');
    accountChanged: Subject<Account> = new Subject<Account>();

    constructor(private http: HttpClient, private router: Router, private reviewService: ReviewService) {
        this.http
        .get<any>(
            environment.API_URL + '/api/auth/login-check',
            environment.DEFAULT_HTTP_OPTIONS
        ).subscribe((res: HttpResponse<any>) => {
            const { id, username } = res.body;

            this.account = new Account(id || -1, username || '');
            this.accountChanged.next(this.account);
            if (this.account.id != -1) this.reviewService.fetchTakenReviews();
        });

        this.accountChanged.next(this.account);
    }

    login(username: string, password: string) {
        return this.http
        .post<any>(
            environment.API_URL + '/api/auth/login',
            {
                username: username,
                password: password
            },
            environment.DEFAULT_HTTP_OPTIONS
        )
    }

    register(username: string, password: string) {
        return this.http
        .post<any>(
            environment.API_URL + '/api/auth/register',
            {
                username: username,
                password: password
            },
            environment.DEFAULT_HTTP_OPTIONS
        )
    }

    logout() {
        this.http
        .get<any>(
            environment.API_URL + '/api/auth/logout',
            environment.DEFAULT_HTTP_OPTIONS
        ).subscribe(() => {
            this.account = new Account(-1, '');
            this.accountChanged.next(this.account);
            this.reviewService.fetchReviews();
            this.reviewService.takenReviews = [];
            this.reviewService.takenReviewsChanged.next(this.reviewService.takenReviews);
            this.reviewService.fetchReviews();
            this.router.navigate(['login']);
        })
    }
}
