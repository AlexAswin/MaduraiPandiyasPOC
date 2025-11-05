import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit {

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { userId, password } = this.loginForm.value;

    if (userId === 'Madurai Pandiyas' && password === '123456') {
      console.log('Login successful!');
      localStorage.setItem('UserId', userId);
      this.router.navigate(['/shipment']);
    } else if (userId === 'Madurai Pandiyas Elite' && password === '123456') {
      localStorage.setItem('UserId', userId);
      this.router.navigate(['/shipment']);
    } else if (userId === 'Ram Madurai Pandiyas' && password === '123456') {
      localStorage.setItem('UserId', userId);
      this.router.navigate(['/total-shipments']);
    } else {
      console.log('Invalid credentials');
      alert('Invalid User ID or Password');
    }
  }

}
