﻿import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialLib } from '../shared/materialLib.module';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core'
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { VoidwellPipesModule } from '../shared/pipes/voidwellpipes.modules';
import { routing } from './admin.routes';
import { AdminWrapperComponent } from './adminwrapper.component';
import { DashboardComponent } from './dashboard.component';
import { BlogComponent, BlogEditorDialog } from './blog.component';
import { UsersComponent, UserEditorDialog } from './users.component';
import { RolesComponent } from './roles.component';
import { EventsComponent, EventEditorDialog } from './events.component';
import { ServicesComponent } from './services.component';
import { PsbComponent } from './psb.component';

@NgModule({
    declarations: [
        AdminWrapperComponent,
        DashboardComponent,
        BlogComponent,
        UsersComponent,
        RolesComponent,
        EventsComponent,
        ServicesComponent,
        PsbComponent,
        EventEditorDialog,
        UserEditorDialog,
        BlogEditorDialog
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialLib,
        CommonModule,
        VoidwellPipesModule,
        routing,
        SharedComponentsModule,
        MatNativeDatetimeModule,
        MatDatetimepickerModule
    ],
    entryComponents: [
        AdminWrapperComponent,
        EventEditorDialog,
        UserEditorDialog,
        BlogEditorDialog
    ]
})
export class AdminModule { }
