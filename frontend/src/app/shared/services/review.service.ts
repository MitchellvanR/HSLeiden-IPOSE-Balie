import { Subject } from 'rxjs';
import { Review } from '../models/review.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { first, tap } from 'rxjs/operators';
import { AssignmentService } from './assignment.service';

@Injectable()
export class ReviewService {
  private reviews: Review[] = [];
  reviewsChanged = new Subject<Review[]>();
  public takenReviews: Review[] = [];
  public updatedAt: Date = new Date();
  public updatedAtChanged: Subject<Date> = new Subject<Date>();
  takenReviewsChanged = new Subject<Review[]>();

  constructor(
    private http: HttpClient,
    private assignmentService: AssignmentService
  ) {
    this.reviewsChanged.next(this.reviews);
    this.fetchReviews();

    this.takenReviewsChanged.next(this.takenReviews);
  }

  fetchReviews() {
    this.http
      .get<any>(
        environment.API_URL + '/api/review',
        environment.DEFAULT_HTTP_OPTIONS
      )
      .subscribe((res: HttpResponse<any>) => {
        this.reviews = [];
        res.body.reviews.map((review) => {
          this.reviews.push(
            new Review(
              review.id,
              review.student_number,
              review.request_time,
              review.assignment_id
            )
          );
        });

        this.updatedAt = new Date();
        this.updatedAtChanged.next(this.updatedAt);

        this.reviewsChanged.next(this.reviews);
      });
  }

  fetchTakenReviews() {
    return this.http
      .get<any>(
        environment.API_URL + `/api/review/taken`,
        environment.DEFAULT_HTTP_OPTIONS
      )
      .subscribe((res: HttpResponse<any>) => {
        this.takenReviews = [];
        res.body.reviews.map((review) => {
          this.takenReviews.push(
            new Review(
              review.id,
              review.student_number,
              review.request_time,
              review.assignment_id
            )
          );
        });

        this.updatedAt = new Date();
        this.updatedAtChanged.next(this.updatedAt);

        this.takenReviewsChanged.next(this.takenReviews);
      });
  }

  setReviews(reviews: Review[]) {
    this.reviews = reviews;
  }

  getReviews() {
    return this.reviews.slice();
  }

  getTakenReviews() {
    return this.takenReviews.slice();
  }

  getReview(index: number) {
    return this.reviews[index];
  }

  getReviewById(id: number) {
    return this.http.get<any>(
      environment.API_URL + `/api/review/${id}`,
      environment.DEFAULT_HTTP_OPTIONS
    );
  }

  updateReviewById(
    reviewData: {
      artist: string;
      name: string;
      origin: string;
      cost: number;
      year: number;
      imageUrl: string;
    },
    id: number
  ) {
    return this.http.put<any>(
      environment.API_URL + `/api/review/${id}`,
      reviewData,
      environment.DEFAULT_HTTP_OPTIONS
    );
  }

  createReview(reviewData: { studentNumber: string; assignmentId: number }) {
    return this.http.post<any>(
      environment.API_URL + `/api/review`,
      reviewData,
      environment.DEFAULT_HTTP_OPTIONS
    );
  }

  removeReview(review: Review) {
    this.http
      .delete<any>(
        environment.API_URL + `/api/review/${review.id}`,
        environment.DEFAULT_HTTP_OPTIONS
      )
      .pipe(first())
      .subscribe(
        (res: HttpResponse<any>) => {
          for (let i = 0; i < this.reviews.length; i++) {
            if (this.reviews[i].id == review.id) {
              this.reviews.splice(i, 1);
              this.reviewsChanged.next(this.reviews);
              break;
            }
          }
        },
        (e) => {
          alert(e.error.message || 'Oops, something went wrong...');
        }
      );
  }

  setAssigned(index: number) {
    return this.http
      .patch<any>(
        environment.API_URL + `/api/review/${index}`,
        {},
        environment.DEFAULT_HTTP_OPTIONS
      )
      .subscribe(
        () => {
          this.fetchReviews();
          this.fetchTakenReviews();
        },
        (e) => {
          alert(
            (e.error.ninja ? `\n😱 Een college was je voor! \n\n\n Het overkomt ons allemaal... \n\n\n❤️ Groetjes van ${e.error.ninja}` : false) ||
            e.error.message ||
            'Oops, something went wrong...'
          );
          this.fetchReviews();
        }
      );
  }

  closeReview(index: number) {
    return this.http
      .patch<any>(
        environment.API_URL + `/api/review/close/${index}`,
        {},
        environment.DEFAULT_HTTP_OPTIONS
      )
      .subscribe(
        () => {
          this.fetchReviews();
          this.fetchTakenReviews();
        },
        (e) => {
          alert(e.error.message || 'Oops, something went wrong...');
        }
      );
  }
}
