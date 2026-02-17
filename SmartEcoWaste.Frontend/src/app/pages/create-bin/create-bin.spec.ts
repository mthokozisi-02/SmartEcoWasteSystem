import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBin } from './create-bin';

describe('CreateBin', () => {
  let component: CreateBin;
  let fixture: ComponentFixture<CreateBin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
