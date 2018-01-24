﻿import { Component, OnInit, ViewChild, Injector } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable, MatPaginator } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';

@Component({
    templateUrl: './planetside-alert-outfits.template.html',
    styleUrls: ['./planetside-alert-outfits.styles.css']
})

export class PlanetsideAlertOutfitsComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    private dataSource: TableDataSource;

    constructor(private injector: Injector) {
    }

    ngOnInit() {
        var inj: any = this.injector;
        let combatEvent = inj.view.viewContainerParent.component;

        combatEvent.event.subscribe(alert => {
            if (alert == null) {
                return;
            }

            this.sort.sort(<MatSortable>{
                id: 'kills',
                start: 'desc'
            });

            this.dataSource = new TableDataSource(alert.log.stats.outfits, this.sort, this.paginator);
        });
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data, private sort: MatSort, private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<any[]> {
        let first = Observable.of(this.data);
        return Observable.merge(first, this.sort.sortChange, this.paginator.page).map(() => {
            const data = this.data.slice();

            let sortedData = this.getSortedData(data);

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return sortedData.splice(startIndex, this.paginator.pageSize);
        });
    }

    getSortedData(data: any) {
        if (!data) {
            return null;
        }

        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let propertyA: any;
            let propertyB: any;

            switch (this.sort.active) {
                case 'name': [propertyA, propertyB] = [a.outfit.name, b.outfit.name]; break;
                case 'kills': [propertyA, propertyB] = [a.kills, b.kills]; break;
                case 'vehicleKills': [propertyA, propertyB] = [a.vehicleKills, b.vehicleKills]; break;
                case 'deaths': [propertyA, propertyB] = [a.deaths, b.deaths]; break;
                case 'kdr': [propertyA, propertyB] = [(a.kills / a.deaths), (b.kills / b.deaths)]; break;
                case 'tks': [propertyA, propertyB] = [a.teamkills, b.teamkills]; break;
                case 'suicides': [propertyA, propertyB] = [a.suicides, b.suicides]; break;
                case 'headshots': [propertyA, propertyB] = [a.headshots, b.headshots]; break;
                case 'hsper': [propertyA, propertyB] = [(a.headshots / a.kills), (b.headshots / b.kills)]; break;
            }

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}