import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, Button, Card],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class Unauthorized {
  private router = inject(Router);

  volverAlInicio(): void {
    this.router.navigate(['/inicio']);
  }
}
