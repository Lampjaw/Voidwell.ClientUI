﻿import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable, MatPaginator } from '@angular/material';
import { Observable, Subscription, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlanetsideApi } from './../shared/services/planetside-api.service';
import { PlanetsideItemComponent } from './planetside-item.component';

@Component({
    templateUrl: './planetside-item-leaderboard.template.html',
    styleUrls: ['./planetside-item-leaderboard.styles.css']
})

export class PlanetsideItemLeaderboardComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    errorMessage: string = null;
    isLoading: boolean = true;
    weaponDataSub: Subscription;
    leaderboard: any[] = [];

    public dataSource: TableDataSource;

    constructor(private itemComponent: PlanetsideItemComponent, private api: PlanetsideApi) {
        
    }

    ngOnInit() {
        this.isLoading = true;

        this.sort.sort(<MatSortable>{
            id: 'kills',
            start: 'desc'
        });

        this.dataSource = new TableDataSource(this.leaderboard, this.sort, this.paginator);

        this.weaponDataSub = this.itemComponent.weaponData.subscribe(data => {
            this.isLoading = true;
            if (data) {
                this.api.getWeaponLeaderboard(data.itemId).subscribe(leaderboard => {
                    this.leaderboard = leaderboard;
                    this.dataSource = new TableDataSource(this.leaderboard, this.sort, this.paginator);

                    this.isLoading = false;
                });
            }
        });
    }

    ngOnDestroy() {
        if (this.weaponDataSub) this.weaponDataSub.unsubscribe();
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(public data, private sort: MatSort, private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<any[]> {
        let first = of(this.data);
        return merge(first, this.sort.sortChange, this.paginator.page).pipe(map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            let sortedData = this.getSortedData(data);

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return sortedData.splice(startIndex, this.paginator.pageSize);
        }));
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
                case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
                case 'kills': [propertyA, propertyB] = [a.kills, b.kills]; break;
                case 'vehicleKills': [propertyA, propertyB] = [a.vehicleKills, b.vehicleKills]; break;
                case 'deaths': [propertyA, propertyB] = [a.deaths, b.deaths]; break;
                case 'kdr': [propertyA, propertyB] = [(a.kills / a.deaths), (b.kills / b.deaths)]; break;
                case 'kdrDelta': [propertyA, propertyB] = [a.kdrDelta, b.kdrDelta]; break;
                case 'aga': [propertyA, propertyB] = [a.aga, b.aga]; break;
                case 'accuracy': [propertyA, propertyB] = [(a.shotsHit / a.shotsFired), (b.shotsHit / b.shotsFired)]; break;
                case 'accuracyDelta': [propertyA, propertyB] = [a.accuracyDelta, b.accuracyDelta]; break;
                case 'hsr': [propertyA, propertyB] = [(a.headshots / a.kills), (b.headshots / b.kills)]; break;
                case 'hsrDelta': [propertyA, propertyB] = [a.hsrDelta, b.hsrDelta]; break;
                case 'kph': [propertyA, propertyB] = [(a.kills / (a.playTime / 3600)), (b.kills / (b.playTime / 3600))]; break;
                case 'kphDelta': [propertyA, propertyB] = [a.kphDelta, b.kphDelta]; break;
            }

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}