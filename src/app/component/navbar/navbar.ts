import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { UsuariosService } from '../../servicios/usuarios.service';
import { UsuarioDetalleResponse } from '../../modelos/usuarios';

import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    // PrimeNG Modules
    MenubarModule,
    AvatarModule,
    MenuModule,
    BadgeModule,
    SkeletonModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  usuario = signal<UsuarioDetalleResponse | null>(null);

  // Items del menú principal
  menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/inicio',
    },
    {
      label: 'Solicitudes',
      icon: 'pi pi-list',
      routerLink: '/solicitudes',
    },
    {
      label: 'Nueva Solicitud',
      icon: 'pi pi-plus-circle',
      routerLink: '/crear-solicitud',
    },
  ];

  // Items del menú del usuario
  userMenuItems: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      command: () => this.irAPerfil(),
    },
    {
      separator: true,
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
      styleClass: 'logout-item',
    },
  ];

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.usuariosService.obtenerPerfil().subscribe({
      next: (data) => {
        this.usuario.set(data);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        // Si falla la carga del perfil, probablemente el token expiró
        this.logout();
      },
    });
  }

  irAPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    // Eliminar token
    localStorage.removeItem('auth_token');

    // Limpiar datos del usuario
    this.usuario.set(null);

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  getInitials(nombre: string): string {
    if (!nombre) return 'U';

    const palabras = nombre.trim().split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  getRolIcon(rol: string): string {
    const iconMap: { [key: string]: string } = {
      ESTUDIANTE: 'pi pi-user',
      DOCENTE: 'pi pi-book',
      ADMINISTRATIVO: 'pi pi-briefcase',
      DIRECTIVO: 'pi pi-star',
    };
    return iconMap[rol] || 'pi pi-user';
  }

  getRolSeverity(rol: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: { [key: string]: 'success' | 'info' | 'warn' | 'danger' } = {
      ESTUDIANTE: 'info',
      DOCENTE: 'success',
      ADMINISTRATIVO: 'warn',
      DIRECTIVO: 'danger',
    };
    return severityMap[rol] || 'info';
  }
}
