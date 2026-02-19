import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBins } from './manage-bins';

describe('ManageBins', () => {
  let component: ManageBins;
  let fixture: ComponentFixture<ManageBins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBins]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBins);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
