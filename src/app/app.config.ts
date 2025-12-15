import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyAViDR1Ng61PZF4hNl_BwCRx4QG2fAktwo',
        authDomain: 'maduraipandiyasshipmentpoc.firebaseapp.com',
        projectId: 'maduraipandiyasshipmentpoc',
        storageBucket: 'maduraipandiyasshipmentpoc.firebasestorage.app',
        messagingSenderId: '134451260435',
        appId: '1:134451260435:web:1ef72d0b9c4983fb4c23e6',
        measurementId: 'G-YJ66XK83P8',
        // apiKey: 'AIzaSyCpoWIn3AM8p8-eSJSIWRcdUNLlvmSirDM',
        // authDomain: 'madurai-pandiyas.firebaseapp.com',
        // projectId: 'madurai-pandiyas',
        // storageBucket: 'madurai-pandiyas.firebasestorage.app',
        // messagingSenderId: '913572215946',
        // appId: '1:913572215946:web:7d5c07294cc2ba30344173',
        // measurementId: 'G-JV8EMP9JKR',
      })
    ),
    provideFirestore(() => getFirestore()),
  ],
};
