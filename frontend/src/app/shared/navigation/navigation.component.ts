import { Component, OnInit, Output } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
    @Output() windowWidth: number;
    @Output() links = [
        ['HOME', '/'],
        ['LOGIN', '/login']
    ];
    @Output() menuOpen = false;
    accountChangedSubscription: Subscription;

    constructor(public accountService: AccountService) { }

    ngOnInit(): void {
        this.windowWidth = window.innerWidth;
    }

    toggleMenu(): void {
        this.windowWidth = window.innerWidth;
        this.menuOpen = !this.menuOpen 
    }
}
