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
      })
    ),
    provideFirestore(() => getFirestore()),
  ],
};
