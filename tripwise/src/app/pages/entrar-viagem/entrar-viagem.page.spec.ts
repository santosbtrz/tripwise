import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntrarViagemPage } from './entrar-viagem.page';

describe('EntrarViagemPage', () => {
  let component: EntrarViagemPage;
  let fixture: ComponentFixture<EntrarViagemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrarViagemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
