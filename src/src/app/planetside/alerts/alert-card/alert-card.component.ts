﻿import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-alert-card',
    templateUrl: './alert-card.template.html',
    styleUrls: ['./alert-card.styles.css']
})

export class AlertCardComponent {
    @Input('alert') alert: any;
    @Input('focusEvent') focusEvent: boolean;

    defaultAlertLengthMinutes = 45;

    isAlertActive(): boolean {
        return this.getEndDate() > new Date();
    }

    getEndDate(): Date {
        if (this.alert.endDate) {
            return new Date(this.alert.endDate);
        }

        let startString = this.alert.startDate;
        let startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * this.defaultAlertLengthMinutes);
    }

    isNeuturalMetagame(alert): boolean {
        if (!alert || !alert.metagameEvent) {
            return true;
        }

        let type = alert.metagameEvent.type;
        return type === 1 || type === 8 || type === 9;
    }
}