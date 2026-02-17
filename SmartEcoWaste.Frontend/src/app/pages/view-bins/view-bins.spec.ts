import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBins } from './view-bins';

describe('ViewBins', () => {
  let component: ViewBins;
  let fixture: ComponentFixture<ViewBins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBins]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBins);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
