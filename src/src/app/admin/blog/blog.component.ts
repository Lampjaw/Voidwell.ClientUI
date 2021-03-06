﻿import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { VoidwellApi } from './../../shared/services/voidwell-api.service';

@Component({
    selector: 'voidwell-admin-blog',
    templateUrl: './blog.template.html',
    styleUrls: ['./blog.styles.css']
})

export class BlogComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    errorMessage: string = null;
    blogPosts: Array<any> = [];
    isLoading: boolean;
    isCreating: boolean;
    getBlogPostsRequest: Subscription;
    dataSource: TableDataSource;

    constructor(private api: VoidwellApi, private dialog: MatDialog) {

    }

    ngOnInit() {
        this.isLoading = true;
        this.dataSource = new TableDataSource(this.blogPosts, this.paginator);

        this.getBlogPostsRequest = this.api.getAllBlogPosts()
            .subscribe(blogPosts => {
                this.blogPosts = blogPosts || [];
                this.dataSource = new TableDataSource(this.blogPosts, this.paginator);

                this.isLoading = false;
            });
    }

    newPost() {
        let dialogRef = this.dialog.open(BlogEditorDialog);

        dialogRef.afterClosed().subscribe(result => {
            this.blogPosts.push(result);
        });
    }

    onEdit(entry: any) {

        let dialogRef = this.dialog.open(BlogEditorDialog, {
            data: {
                entry: entry
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            
        });
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(public data, private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<any[]> {
        let first = of(this.data);
        return merge(first, this.paginator.page).pipe(map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return data.splice(startIndex, this.paginator.pageSize);
        }));
    }

    disconnect() { }
}

@Component({
    selector: 'blog-editor-dialog',
    templateUrl: 'blog-editor-dialog.html',
})
export class BlogEditorDialog {
    public entry: any;
    public errorMessage: string;
    updateList: boolean = false;

    constructor(public dialogRef: MatDialogRef<BlogEditorDialog>, private api: VoidwellApi, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.errorMessage = null;

        this.entry = {
            title: null,
            content: null
        };

        if (this.data && this.data.entry) {
            this.entry = Object.assign({}, this.data.entry);
        }
    }

    onSaveBlogPost(blogPost: any) {
        if (blogPost.id) {
            this.api.updateBlogPost(blogPost.id, blogPost)
                .subscribe(result => {
                    this.entry = result;
                    Object.assign(this.data.entry, result);
                });
        } else {
            this.api.createBlogPost(blogPost)
                .subscribe(result => {
                    this.entry = result;
                    this.updateList = true;
                });
        }
    }

    onDeleteBlogPost(blogPost: any) {
        this.api.deleteBlogPost(blogPost.id)
            .subscribe(result => {
                this.closeDialog();
            });
    }

    closeDialog() {
        if (this.updateList) {
            this.dialogRef.close(this.entry);
        } else {
            this.dialogRef.close();
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}