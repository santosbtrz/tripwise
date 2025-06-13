import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-criar-viagem',
  templateUrl: './criar-viagem.page.html',
  styleUrls: ['./criar-viagem.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CriarViagemPage implements OnInit {

  constructor() {}

  ngOnInit() {}

  handleKeyDown(id: string, event: KeyboardEvent) {
    const currentInput = document.getElementById(id) as HTMLInputElement;
    if (!currentInput) return;

    const valueLength = currentInput.value.length;
    const maxLength = currentInput.maxLength;

    if (event.key === 'Backspace' && valueLength === 0) {
      const prevId = this.getPreviousInputId(id);
      if (prevId) {
        const prevInput = document.getElementById(prevId) as HTMLInputElement;
        prevInput?.focus();
      }
    }

    if (event.key !== 'Backspace' && valueLength >= maxLength) {
      const nextId = this.getNextInputId(id);
      if (nextId) {
        const nextInput = document.getElementById(nextId) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  }

  private getPreviousInputId(currentId: string): string | null {
    const inputOrder = [
      'dia-ida', 'mes-ida', 'ano-ida',
      'dia-volta', 'mes-volta', 'ano-volta'
    ];
    const index = inputOrder.indexOf(currentId);
    return index > 0 ? inputOrder[index - 1] : null;
  }

  private getNextInputId(currentId: string): string | null {
    const inputOrder = [
      'dia-ida', 'mes-ida', 'ano-ida',
      'dia-volta', 'mes-volta', 'ano-volta'
    ];
    const index = inputOrder.indexOf(currentId);
    return index >= 0 && index < inputOrder.length - 1 ? inputOrder[index + 1] : null;

  }

  valor: string = '';
    formatarMoeda(event: Event) {
      const input = (event.target as HTMLInputElement);
      let valor = input.value.replace(/\D/g, '');

      valor = (parseFloat(valor) / 100).toFixed(2);
      valor = valor.replace('.', ',')
      valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

      this.valor = 'R$' + valor;

    }
  
}

