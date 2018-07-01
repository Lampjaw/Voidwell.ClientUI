﻿import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PlanetsideApi } from './../../planetside-api.service';
import { WorldNamePipe } from './../../../shared/pipes/ps2/world-name.pipe';

@Component({
    templateUrl: './planetside-world.template.html'
})

export class PlanetsideWorldComponent implements OnDestroy {
    private routeSub: Subscription;

    worldId: number = null;

    navLinks = [
        { path: 'players', display: 'Online players' },
        { path: 'map', display: 'Map' }
    ];

    constructor(private route: ActivatedRoute, private api: PlanetsideApi, private worldName: WorldNamePipe) {
        this.routeSub = this.route.params.subscribe(params => {
            if (!params['worldId']) {
                return;
            }
            this.worldId = parseInt(params['worldId']);
        });
    }

    getOnlinePlayers(): Observable<any> {
        return this.api.getOnlinePlayers(this.worldId);
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}