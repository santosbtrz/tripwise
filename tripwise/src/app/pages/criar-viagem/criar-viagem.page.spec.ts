import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarViagemPage } from './criar-viagem.page';

describe('CriarViagemPage', () => {
  let component: CriarViagemPage;
  let fixture: ComponentFixture<CriarViagemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriarViagemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
