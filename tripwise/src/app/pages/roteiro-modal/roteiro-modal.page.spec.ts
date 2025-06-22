import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoteiroModalPage } from './roteiro-modal.page';

describe('RoteiroModalPage', () => {
  let component: RoteiroModalPage;
  let fixture: ComponentFixture<RoteiroModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RoteiroModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
