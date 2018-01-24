﻿import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEvent';

@Component({
    selector: 'voidwell-admin-users',
    templateUrl: './users.template.html',
    styleUrls: ['./users.styles.css']
})

export class UsersComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filter') filter: ElementRef;

    users: Array<any> = [];
    roles: Array<any>;
    errorMessage: string = null;
    isLoading: boolean = false;
    isLoadingUsers: boolean = false;
    isLoadingRoles: boolean = false;
    getUsersRequest: Subscription;
    getRolesRequest: Subscription;

    private dataSource: TableDataSource;

    constructor(private api: VoidwellApi, private dialog: MatDialog) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.dataSource = new TableDataSource(this.users, this.paginator);

        this.isLoadingUsers = true;
        this.getUsersRequest = this.api.getUsers()
            .subscribe(users => {
                this.users = users;
                this.dataSource = new TableDataSource(this.users, this.paginator);
                this.isLoadingUsers = false;
                this.updateLoading();
            });

        this.isLoadingRoles = true;
        this.getRolesRequest = this.api.getAllRoles()
            .subscribe(roles => {
                this.roles = roles;
                this.isLoadingRoles = false;
                this.updateLoading();
            });

        this.updateLoading();

        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    onEdit(user: any) {
        let dialogRef = this.dialog.open(UserEditorDialog, {
            data: {
                userId: user.id,
                roles: this.roles
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            //Todo: save event after editing.
        });
    }

    private updateLoading() {
        this.isLoading = this.isLoadingRoles || this.isLoadingUsers;
    }

    ngOnDestroy() {
        if (this.getUsersRequest) {
            this.getUsersRequest.unsubscribe();
        }
        if (this.getRolesRequest) {
            this.getRolesRequest.unsubscribe();
        }
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data, private paginator: MatPaginator) {
        super();
    }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    connect(): Observable<any[]> {
        let first = Observable.of(this.data);
        return Observable.merge(first, this.paginator.page, this._filterChange).map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            let filteredData = data.filter(item => {
                let searchStr = item.userName.toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) != -1;
            });

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return filteredData.splice(startIndex, this.paginator.pageSize);
        });
    }

    disconnect() { }
}

@Component({
    selector: 'user-editor-dialog',
    templateUrl: 'user-editor-dialog.html',
})
export class UserEditorDialog {
    private errorMessage: string;
    private isLoading: boolean;
    private user: any;

    constructor(public dialogRef: MatDialogRef<UserEditorDialog>, private api: VoidwellApi, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.errorMessage = null;
        this.isLoading = true;

        this.api.getUser(this.data.userId)
            .subscribe(user => {
                this.user = user;
                this.isLoading = false;
            });
    }

    private setRoles(user, userRolesForm: NgForm) {
        if (userRolesForm.pristine) {
            return;
        }

        this.errorMessage = null;
        user.isLocked = true;
        this.api.updateUserRoles(user.id, userRolesForm.value)
            .catch(error => {
                this.errorMessage = error._body;
                userRolesForm.form.patchValue(user);
                return Observable.throw(error);
            })
            .finally(() => {
                user.isLocked = false;
                userRolesForm.form.markAsPristine();
            })
            .subscribe(updatedRoles => {
                user.roles = updatedRoles;
            });
    }

    lockUser(user: any) {
        this.errorMessage = null;
        user.isLocked = true;

        let params = {
            IsPermanant: true,
            LockLength: 60
        };

        this.api.lockUser(this.data.userId, params)
            .subscribe(() => {
                user.isLocked = false;
            });
    }

    unlockUser(user: any) {
        this.errorMessage = null;
        user.isLocked = true;

        this.api.unlockUser(this.data.userId)
            .subscribe(() => {
                user.isLocked = false;
            });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}