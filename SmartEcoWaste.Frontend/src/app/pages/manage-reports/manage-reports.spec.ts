import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReports } from './manage-reports';

describe('ManageReports', () => {
  let component: ManageReports;
  let fixture: ComponentFixture<ManageReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
