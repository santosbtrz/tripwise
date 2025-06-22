import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarTarefaPage } from './criar-tarefa.page';

describe('CriarTarefaPage', () => {
  let component: CriarTarefaPage;
  let fixture: ComponentFixture<CriarTarefaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriarTarefaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
