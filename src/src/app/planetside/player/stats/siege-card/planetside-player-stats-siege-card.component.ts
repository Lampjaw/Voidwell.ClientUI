import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
    selector: 'planetside-player-stats-siege-card',
    templateUrl: './planetside-player-stats-siege-card.template.html',
    styleUrls: ['./planetside-player-stats-siege-card.styles.css']
})

export class PlanetsidePlayerStatsSiegeCardComponent implements OnInit {
    @Input() captured: number;
    @Input() defended: number;
    @ViewChild('siegegauge', { static: true }) gaugeElement: ElementRef;

    private d3: D3;

    constructor(element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
    }

    public siegeLevel: number;

    ngOnInit() {
        let d3 = this.d3;
        let gaugeElem = this.gaugeElement.nativeElement;

        this.siegeLevel = this.captured / this.defended * 100;

        let config = {
            size						: 200,
            clipWidth					: 200,
            clipHeight					: 110,
            ringInset					: 20,
            ringWidth					: 30,

            pointerWidth				: 5,
            pointerTailLength			: 5,
            pointerHeadLengthPercent	: 0.9,

            minValue					: 0,
            maxValue					: 100,

            minAngle					: -90,
            maxAngle					: 90,

            transitionMs				: 4000,

            majorTicks					: 500,
            textTicks                   : 10,
            labelFormat					: d3.format(''),
            labelInset					: 10,

            arcColorFn					: d3.interpolateHsl('#686e7d', '#b11b1b')
        };

        let range = undefined;
        let r = undefined;
        let pointerHeadLength = undefined;

        let svg = undefined;
        let arc = undefined;
        let scale = undefined;
        let ticks = undefined;
        let tickData = undefined;
        let pointer = undefined;

        function deg2rad(deg) {
            return deg * Math.PI / 180;
        }

        function centerTranslation() {
            return 'translate(' + r + ',' + r + ')';
        }

        function configure() {
            range = config.maxAngle - config.minAngle;
            r = config.size / 2;
            pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

            // a linear scale that maps domain values to a percent from 0..1
            scale = d3.scaleLinear()
                .range([0, 1])
                .domain([config.minValue, config.maxValue]);

            ticks = scale.ticks(config.textTicks);
            tickData = d3.range(config.majorTicks).map(function() {return 1 / config.majorTicks; });

            arc = d3.arc()
                .innerRadius(r - config.ringWidth - config.ringInset)
                .outerRadius(r - config.ringInset)
                .startAngle(function(d: any, i: any) {
                    let ratio = d * i;
                    return deg2rad(config.minAngle + (ratio * range));
                })
                .endAngle(function(d: any, i: any) {
                    let ratio = d * (i + 1);
                    return deg2rad(config.minAngle + (ratio * range));
                });
        }

        function render(newValue) {
            svg = d3.select(gaugeElem)
                .append('svg:svg')
                .attr('width', config.clipWidth)
                .attr('height', config.clipHeight);

            let centerTx = centerTranslation();

            svg.append('g')
                .attr('transform', centerTx)
                .selectAll('path')
                .data(d3.range(500).map(function () { return 1 / 500; }))
                .enter().append('path')
                .attr('d', arc)
                .style('fill', function (d, i) { return config.arcColorFn(d * i); });

            let lg = svg.append('g')
                    .attr('class', 'label')
                    .attr('transform', centerTx);
            lg.selectAll('text')
                    .data(ticks)
                .enter().append('text')
                    .attr('transform', function(d) {
                        let ratio = scale(d);
                        let newAngle = config.minAngle + (ratio * range);
                        return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
                    })
                    .text(config.labelFormat);

            let lineData = [ [config.pointerWidth / 2, 0],
                            [0, -pointerHeadLength],
                            [-(config.pointerWidth / 2), 0],
                            [0, config.pointerTailLength],
                            [config.pointerWidth / 2, 0] ];
            let pointerLine = d3.line();
            let pg = svg.append('g').data([lineData])
                    .attr('class', 'pointer')
                    .attr('transform', centerTx);

            pointer = pg.append('path')
                .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
                .attr('transform', 'rotate(' + config.minAngle + ')');

            update(newValue === undefined ? 0 : newValue);
        }

        function update(newValue) {
            let ratio = scale(newValue);
            let newAngle = config.minAngle + (ratio * range);

            pointer.transition()
                .duration(config.transitionMs)
                .ease(d3.easeElastic)
                .attr('transform', 'rotate(' + newAngle + ')');
        }

        configure();
        render(undefined);
        update(Math.min(this.siegeLevel, 100));
    }
}