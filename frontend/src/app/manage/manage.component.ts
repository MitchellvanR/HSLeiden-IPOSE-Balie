import {
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Assignment } from '../shared/models/assignment.model';
import { Review } from '../shared/models/review.model';
import { AccountService } from '../shared/services/account.service';
import { AssignmentService } from '../shared/services/assignment.service';
import { ReviewService } from '../shared/services/review.service';

import studentData from '../../utilities/student-data.js';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  @Output() reviewList: Review[] = [];
  @Output() takenReviewsList: Review[] = [];
  reviewsChangedSubscription: Subscription;
  reviewRequestSubscription: Subscription;
  currentAssignmentSubscription: Subscription;
  updatedAtSubscription: Subscription;
  @ViewChild('reviewForm') form: NgForm;
  assignments: Assignment[] = [];
  currentAssignment: Assignment = null;
  lastUpdate: Date = new Date();

  constructor(
    public reviewService: ReviewService,
    public accountService: AccountService,
    public assignmentService: AssignmentService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    if (this.assignmentService.currentAssignment) {
      this.reviewList = this.reviewService.getReviews().filter((i) => {
        return (
          i.assignmentId ==
          (this.assignmentService.currentAssignment
            ? this.assignmentService.currentAssignment.id
            : i.assignmentId)
        );
      });

      this.takenReviewsList = this.reviewService
        .getTakenReviews()
        .filter((i) => {
          return (
            i.assignmentId ==
            (this.assignmentService.currentAssignment
              ? this.assignmentService.currentAssignment.id
              : i.assignmentId)
          );
        });
    }

    this.updatedAtSubscription = this.reviewService.updatedAtChanged.subscribe(
      (i) => (this.lastUpdate = i)
    );

    this.reviewsChangedSubscription = this.reviewService.reviewsChanged.subscribe(
      (reviews) => {
        this.reviewList = reviews.filter((i) => {
          return (
            i.assignmentId ==
            (this.assignmentService.currentAssignment
              ? this.assignmentService.currentAssignment.id
              : i.assignmentId)
          );
        });
      }
    );
    this.reviewsChangedSubscription = this.reviewService.takenReviewsChanged.subscribe(
      (reviews) => {
        this.takenReviewsList = reviews.filter((i) => {
          return (
            i.assignmentId ==
            (this.assignmentService.currentAssignment
              ? this.assignmentService.currentAssignment.id
              : i.assignmentId)
          );
        });
      }
    );

    this.elementRef.nativeElement.ownerDocument.body.classList.add('grey-body');

    this.assignments = this.assignmentService.assignments;
    this.assignmentService.assignmentsChanged.subscribe((assignments) => {
      this.assignments = assignments;
    });

    this.currentAssignment = this.assignmentService.currentAssignment;
    this.currentAssignmentSubscription = this.assignmentService.currentAssignmentChanged.subscribe(
      (assignment: Assignment) => {
        this.currentAssignment = assignment;

        this.takenReviewsList = this.reviewService
          .getTakenReviews()
          .filter((i) => {
            return (
              i.assignmentId ==
              (this.assignmentService.currentAssignment
                ? this.assignmentService.currentAssignment.id
                : i.assignmentId)
            );
          });

        this.reviewList = this.reviewService.getReviews().filter((i) => {
          return (
            i.assignmentId ==
            (this.assignmentService.currentAssignment
              ? this.assignmentService.currentAssignment.id
              : i.assignmentId)
          );
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.ownerDocument.body.classList.remove(
      'grey-body'
    );

    if (this.reviewsChangedSubscription)
      this.reviewsChangedSubscription.unsubscribe();

    if (this.reviewRequestSubscription)
      this.reviewRequestSubscription.unsubscribe();

    if (this.currentAssignmentSubscription)
      this.currentAssignmentSubscription.unsubscribe();

    if (this.updatedAtSubscription) this.updatedAtSubscription.unsubscribe();
  }

  onSubmit(form: NgForm) {
    if (
      form.value.studentNumber &&
      studentData.indexOf(form.value.studentNumber) == -1
    ) {
      alert('Invalid student number');
      form.reset();
      return;
    }

    this.reviewRequestSubscription = this.reviewService
      .createReview({
        studentNumber: form.value.studentNumber,
        assignmentId: this.assignmentService.currentAssignment.id,
      })
      .subscribe(
        () => {
          this.reviewService.fetchReviews();
        },
        (e) => {
          this.reviewService.fetchReviews();
          alert(e.error.message || 'Oops, something went wrong...');
        }
      );

    form.reset();
  }

  setAssignment(assignment: Assignment): void {
    this.assignmentService.setAssignment(assignment);
  }

  toggleAssignmentOpen() {
    const currentAssignment = this.assignmentService.currentAssignment;
    if (currentAssignment.open) {
      this.assignmentService.closeAssignment(currentAssignment.id).subscribe(
        () => {
          this.assignmentService.fetchAssignments();
        },
        (e) => {
          alert(e.error.message || 'Oops, something went wrong...');
        }
      );
    } else {
      this.assignmentService.openAssignment(currentAssignment.id).subscribe(
        () => {
          this.assignmentService.fetchAssignments();
        },
        (e) => {
          alert(e.error.message || 'Oops, something went wrong...');
        }
      );
    }
  }
}
