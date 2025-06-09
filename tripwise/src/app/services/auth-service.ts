// src/auth-service.ts
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc } from 'firebase/firestore';


export async function cadastrarUsuario(dados: {
  nome: string,
  nascimento: string,
  telefone: string,
  cpf: string,
  email: string,
  senha: string
}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      nome: dados.nome,
      nascimento: dados.nascimento,
      telefone: dados.telefone,
      cpf: dados.cpf,
      email: dados.email,
      uid: user.uid
    });

    return user;
  } catch (error) {
    throw error;
  }
}
