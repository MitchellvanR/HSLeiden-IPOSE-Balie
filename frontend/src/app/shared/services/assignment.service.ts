import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Assignment } from '../models/assignment.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  currentAssignment: Assignment;
  currentAssignmentChanged: Subject<Assignment> = new Subject<Assignment>();
  assignments: Assignment[];
  assignmentsChanged: Subject<Assignment[]> = new Subject<Assignment[]>();

  constructor(private http: HttpClient) {
    this.assignmentsChanged.next(this.assignments);
    this.fetchAssignments();
  }

  setAssignment(assignment): void {
    this.currentAssignment = assignment;
    this.currentAssignmentChanged.next(this.currentAssignment);
  }

  openAssignment(id) {
    return this.http.patch<any>(
      environment.API_URL + `/api/assignments/open/${id}`,
      {},
      environment.DEFAULT_HTTP_OPTIONS
    )
  }

  closeAssignment(id) {
    return this.http.patch<any>(
      environment.API_URL + `/api/assignments/close/${id}`,
      {},
      environment.DEFAULT_HTTP_OPTIONS
    )
  }

  fetchAssignments() {
    this.http
      .get<any>(
        environment.API_URL + '/api/assignments',
        environment.DEFAULT_HTTP_OPTIONS
      )
      .subscribe((res: HttpResponse<any>) => {
        this.assignments = [];
        res.body.assignments.map((assignment) => {
          this.assignments.push(
            new Assignment(assignment.id, assignment.name, assignment.open)
          );
        });

        this.assignmentsChanged.next(this.assignments);

        if (this.assignments.length > 0) {
          this.currentAssignment = this.assignments[0];
          this.currentAssignmentChanged.next(this.currentAssignment);
        }
      });
  }
}
