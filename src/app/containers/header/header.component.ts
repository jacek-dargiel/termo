import { Component, OnInit } from '@angular/core';
import { HeaderFacade } from './header.facade';
import { map } from 'rxjs/operators';

@Component({
  selector: 'termo-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public progress = this.headerFacade.progress.pipe(
    map(progress => progress * 100)
  );
  constructor(
    private headerFacade: HeaderFacade,
  ) { }

  ngOnInit() {
  }

}
