import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViagemCriadaPage } from './viagem-criada.page';

describe('ViagemCriadaPage', () => {
  let component: ViagemCriadaPage;
  let fixture: ComponentFixture<ViagemCriadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViagemCriadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
