import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBin } from './report-bin';

describe('ReportBin', () => {
  let component: ReportBin;
  let fixture: ComponentFixture<ReportBin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportBin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportBin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
