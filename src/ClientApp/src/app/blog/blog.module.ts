﻿import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { MaterialLib } from '../shared/materialLib.module';
import { BlogPostListComponent } from './blog-post-list.component';
import { BlogPostComponent } from './blog-post.component';
import { routing } from './blog.routes';

@NgModule({
    declarations: [
        BlogPostListComponent,
        BlogPostComponent
    ],
    imports: [
        CommonModule,
        MaterialLib,
        routing,
        SharedComponentsModule
    ],
    entryComponents: [BlogPostListComponent]
})
export class BlogModule { }
