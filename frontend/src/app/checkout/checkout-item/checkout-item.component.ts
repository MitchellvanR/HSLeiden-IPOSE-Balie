import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Review } from 'src/app/shared/models/review.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { ReviewService } from 'src/app/shared/services/review.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-checkout-item',
    templateUrl: './checkout-item.component.html',
    styleUrls: ['./checkout-item.component.scss']
})
export class CheckoutItemComponent implements OnInit {
    @Input() review: Review;
    @Input() noButtons: boolean = false;
    @Input() adminView: boolean = false;
    @Input() customClasses: string;
    @Input() index: number;
    @Input() taken: boolean = false;
    reviewRequestSubscription: Subscription;

    constructor(
        public reviewService: ReviewService,
        public accountService: AccountService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        if (this.reviewRequestSubscription)
            this.reviewRequestSubscription.unsubscribe();
    }

    sanitize(text: string){
        return this.sanitizer.bypassSecurityTrustUrl(text);
    }
}
