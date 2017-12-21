import { Component, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { PlanetsidePlayerComponent } from './../planetside-player.component';
import { PlanetsideApi } from './../../planetside-api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
    templateUrl: './planetside-player-vehicles.template.html',
    styleUrls: ['./planetside-player-vehicles.styles.css']
})

export class PlanetsidePlayerVehiclesComponent implements OnDestroy {
    private routeSub: any;
    private isLoading: boolean;
    private vehicles: any[];
    private playerData: any;
    private vehicleId: string;
    private vehicle: any = null;
    private vehicleWeapons = [];
    private allVehicles = [];

    private vehiclesDataSource: DataSource<any>;

    constructor(private planetsidePlayer: PlanetsidePlayerComponent, private api: PlanetsideApi, private route: ActivatedRoute,) {
        this.isLoading = true;
        this.api.getAllVehicles().subscribe(vehicles => {
            planetsidePlayer.playerData.subscribe(data => {
                if (data !== null) {
                    this.playerData = data;
                    this.filterVehicles(vehicles);

                    if (this.vehicleId) {
                        this.setupVehicle(this.vehicleId);
                    }
                }
            });

            this.isLoading = false;
        });

        this.routeSub = this.route.params.subscribe(params => {
            this.vehicle = null;
            this.vehicleWeapons = [];

            this.vehicleId = params['id'];

            if (!this.isLoading && this.vehicleId) {
                this.setupVehicle(this.vehicleId);
            }
        });
    }

    private filterVehicles(data: any) {
        let vehicles = [];

        for (var i = 0; i < data.length; i++) {
            var vehicle = data[i];
            if (vehicle.factions.indexOf(this.playerData.factionId) !== -1 && vehicle.id < 100 && vehicle.id !== '13') {
                vehicles.push(vehicle);
            }
        }

        this.playerData.vehicleStats.forEach(function (d) {
            for (var i = 0; i < vehicles.length; i++) {
                if(vehicles[i].id === d.vehicleId) {
                    vehicles[i].stats = d;
                    break;
                }
            }
        });

        for (var k = 0; k < vehicles.length; k++) {
            if (vehicles[k].id === this.vehicleId) {
                this.vehicle = vehicles[k];
                break;
            }
        }

        this.vehicles = vehicles.sort(this.sortVehicles);
        this.vehiclesDataSource = new VehiclesDataSource(this.vehicles);
    }

    private setupVehicle(vehicleId) {
        for (var w = 0; w < this.playerData.weaponStats.length; w++) {
            let weapon = this.playerData.weaponStats[w];

            if (weapon.vehicleId === this.vehicleId) {
                this.vehicleWeapons.push(weapon);
            }
        }
    }

    private sortVehicles(a, b) {
        if (a.stats.score < b.stats.score)
            return 1
        if (a.stats.score > b.stats.score)
            return -1;
        return 0;
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

export class VehiclesDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        return Observable.of(this.data);
    }

    disconnect() { }
}