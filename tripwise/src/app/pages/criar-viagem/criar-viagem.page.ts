import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { auth, db } from '../../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-criar-viagem',
  templateUrl: './criar-viagem.page.html',
  styleUrls: ['./criar-viagem.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HttpClientModule]
})
export class CriarViagemPage implements OnInit {
  apiKeyLocationIQ: string = 'pk.1f29724e557d2081551060742e0177e3';

  nomeUsuario: string = '';

  viagem: string = '';
  destino: string = '';
  diaIda: string = '';
  mesIda: string = '';
  anoIda: string = '';
  diaVolta: string = '';
  mesVolta: string = '';
  anoVolta: string = '';
  orcamento: string = '';
  ocultarOrcamento: boolean = false;

  destinosSugeridos: { display: string; value: string }[] = [];

  valor: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          this.nomeUsuario = data['nome'] ? data['nome'].split(' ')[0] : 'Usuário';
        } else {
          this.nomeUsuario = 'Usuário';
        }
      } else {
        this.nomeUsuario = 'Usuário';
      }
    });
  }

  gerarCodigo(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 5; i++) {
      const index = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres[index];
    }
    return codigo;
  }

  async salvarViagem() {
    const user = auth.currentUser;

    if (!this.viagem || !this.destino || !this.diaIda || !this.mesIda || !this.anoIda || !this.diaVolta || !this.mesVolta || !this.anoVolta) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (user) {
      const dataIda = `${this.anoIda.padStart(4, '0')}-${this.mesIda.padStart(2, '0')}-${this.diaIda.padStart(2, '0')}`;
      const dataVolta = `${this.anoVolta.padStart(4, '0')}-${this.mesVolta.padStart(2, '0')}-${this.diaVolta.padStart(2, '0')}`;
      const codigoCompartilhamento = this.gerarCodigo();

      try {
        const viagem = {
          nomeViagem: this.viagem,
          destino: this.destino,
          dataIda,
          dataVolta,
          orcamento: this.orcamento,
          ocultarOrcamento: this.ocultarOrcamento,
          codigoCompartilhamento,
          pessoas: [
            {
              uid: user.uid,
              nome: this.nomeUsuario,
              papel: 'criador'
            }
          ]
        };

        const viagensRef = collection(db, 'usuarios', user.uid, 'viagens');
        const docRef = await addDoc(viagensRef, viagem);

        await setDoc(doc(db, 'viagens', docRef.id), {
          ...viagem,
          donoId: user.uid,
          id: docRef.id,
        });

        console.log('Viagem salva com sucesso!');

        this.router.navigate(['/viagem-criada'], {
          state: { viagem: { id: docRef.id, ...viagem } }
        });
      } catch (error) {
        console.error('Erro ao salvar viagem:', error);
      }
    }
  }

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

formatarMoeda(event: Event) {
  const input = (event.target as HTMLInputElement);
  let valor = input.value.replace(/\D/g, '');

  if (valor.length === 0) {
    this.orcamento = '';
    return;
  }

  valor = (parseFloat(valor) / 100).toFixed(2);
  valor = valor.replace('.', ','); 

  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  this.orcamento = 'R$ ' + valor;

  input.value = this.orcamento;
}


  buscarDestino(event: any) {
    const termo = event.target.value;
    if (!termo || termo.length < 3) {
      this.destinosSugeridos = [];
      return;
    }

    const url = `https://us1.locationiq.com/v1/autocomplete.php?key=${this.apiKeyLocationIQ}&q=${encodeURIComponent(termo)}&format=json&limit=5&normalizecity=1&accept-language=pt`;

    this.http.get<any[]>(url).subscribe(res => {
      this.destinosSugeridos = res.map(item => {
        const address = item.address || {};

        const cidade = address.city || address.town || address.village || address.hamlet || address.county || item.display_name.split(',')[0] || '';
        const estadoUF = address.state_code || '';
        const estado = address.state || '';
        const pais = address.country || '';

        let localFormatado = '';

        if (pais.toLowerCase() === 'brasil') {
          if (cidade && estadoUF) {
            localFormatado = `${cidade}, ${estadoUF}`;
          } else if (cidade && estado) {
            localFormatado = `${cidade}, ${estado}`;
          } else if (cidade) {
            localFormatado = cidade;
          } else {
            localFormatado = 'Brasil';
          }
        } else {
          if (cidade && pais) {
            localFormatado = `${cidade}, ${pais}`;
          } else if (pais) {
            localFormatado = pais;
          } else {
            localFormatado = 'Local desconhecido';
          }
        }

        return {
          display: localFormatado,
          value: localFormatado
        };
      });
    }, err => {
      console.error('Erro LocationIQ:', err);
    });
  }

  selecionarDestino(destino: string) {
    this.destino = destino;
    this.destinosSugeridos = [];
  }

async cancelar() {
  const loading = await this.loadingCtrl.create({
    message: '',
    spinner: 'crescent',
    cssClass: 'custom-loading'
  });

  await loading.present();

  await this.router.navigate(['/inicio']); 
  await loading.dismiss(); 
}

}
