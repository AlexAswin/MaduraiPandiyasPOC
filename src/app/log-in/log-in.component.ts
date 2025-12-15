import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent],
  providers: [TitleCasePipe],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit {

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private titlecasePipe: TitleCasePipe) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { userId, password } = this.loginForm.value;
    const formattedUserId = this.titlecasePipe.transform(userId);

    if (formattedUserId === 'Madurai Pandiyas' && password === '123456') {
      localStorage.setItem('UserId', formattedUserId);
      this.router.navigate(['/shipment']);
    } else if (formattedUserId === 'Madurai Pandiyas Elite' && password === '123456') {
      localStorage.setItem('UserId', formattedUserId);
      this.router.navigate(['/shipment']);
    } else if (formattedUserId === 'Ram Madurai Pandiyas' && password === '654123') {
      localStorage.setItem('UserId', formattedUserId);
      this.router.navigate(['/total-shipments']);
    } else {
      alert('Invalid User ID or Password');
    }
  }

}
