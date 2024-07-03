import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DegreesComponent } from './degrees.component';

describe('DegreesComponent', () => {
  let component: DegreesComponent;
  let fixture: ComponentFixture<DegreesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DegreesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DegreesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
