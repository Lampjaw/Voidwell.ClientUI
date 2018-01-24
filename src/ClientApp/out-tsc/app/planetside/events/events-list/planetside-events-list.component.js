"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var voidwell_api_service_1 = require("./../../../shared/services/voidwell-api.service");
var PlanetsideEventsListComponent = (function () {
    function PlanetsideEventsListComponent(api) {
        var _this = this;
        this.api = api;
        this.errorMessage = null;
        this.activeEvents = [];
        this.pastEvents = [];
        this.isLoading = true;
        this.activeEvents = [];
        this.pastEvents = [];
        this.api.getCustomEventsByGame("ps2")
            .subscribe(function (events) {
            for (var i = 0; i < events.length; i++) {
                if (events[i].endDate) {
                    _this.pastEvents.push(events[i]);
                }
                else {
                    _this.activeEvents.push(events[i]);
                }
            }
            _this.isLoading = false;
        });
    }
    PlanetsideEventsListComponent.prototype.getEndDate = function (event) {
        var startString = event.startDate;
        var startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 90);
    };
    return PlanetsideEventsListComponent;
}());
PlanetsideEventsListComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-events-list.template.html',
        styleUrls: ['./planetside-events-list.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi])
], PlanetsideEventsListComponent);
exports.PlanetsideEventsListComponent = PlanetsideEventsListComponent;