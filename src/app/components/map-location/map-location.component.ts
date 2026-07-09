import { Component, Input, OnInit, input, output, ChangeDetectionStrategy, computed, signal, DestroyRef, inject } from '@angular/core';
import {
  isBefore,
  subDays,
  subHours,
  subMilliseconds,
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import { environment } from 'environments/environment';
import { LocationWithKeyMeasurementValues, Location } from '../../interfaces';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';

@Component({
    selector: 'termo-map-location',
    templateUrl: './map-location.component.html',
    styleUrls: ['./map-location.component.scss'],
    imports: [SpinnerComponent, ToFixedPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.location--selected]': 'selected',
        '[style.bottom.%]': 'bottom',
        '[style.right.%]': 'right',
        '(click)': 'selectLocationEntities()',
    },
})
export class MapLocationComponent implements OnInit {
  readonly location = input.required<LocationWithKeyMeasurementValues>();
  readonly loading = input<boolean>();
  @Input()
  selected!: boolean;
  readonly selectLocation = output<Location>();
  bottom!: number;
  right!: number;

  readonly #now = signal(new Date());
  readonly #destroyRef = inject(DestroyRef);

  readonly relativeTime = computed(() => {
    const since = this.#now();
    const value = this.location().updatedAt;
    if (isBefore(value, subDays(since, 2))) {
      const days = differenceInCalendarDays(since, value);
      return `${days} dni`;
    }
    if (isBefore(value, subHours(since, 2))) {
      const hours = differenceInHours(since, value);
      return `${hours} godz.`;
    }
    const minutes = differenceInMinutes(since, value);
    return `${minutes} min.`;
  });

  readonly isOutdated = computed(() => {
    const thresholdDate = subMilliseconds(this.#now(), environment.locationOutdatedThreshold);
    return isBefore(this.location().updatedAt, thresholdDate);
  });

  constructor() {
    const intervalId = setInterval(() => this.#now.set(new Date()), 60_000);
    this.#destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  ngOnInit() {
    this.adjustPosition();
  }

  adjustPosition() {
    this.right = 100 - (this.location().mapPosition.x * 100);
    this.bottom = 100 - (this.location().mapPosition.y * 100);
  }

  selectLocationEntities() {
    this.selectLocation.emit(this.location());
  }

}
