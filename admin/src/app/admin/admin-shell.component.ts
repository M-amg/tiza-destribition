import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  Bell,
  ChartColumn,
  DollarSign,
  FolderTree,
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
  LucideIconData,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Tag,
  UserCog,
  Users,
  Warehouse,
  X
} from 'lucide-angular/src/icons';

import { AuthService } from '../core/auth/auth.service';
import { adminNavItems } from './admin.mock-data';
import { AdminNavItem } from './admin.models';

interface ShellNavItem extends AdminNavItem {
  fullPath: string;
  exact: boolean;
  iconData: LucideIconData;
}

const navIcons: Record<string, LucideIconData> = {
  '': LayoutDashboard,
  products: Package,
  categories: FolderTree,
  orders: ShoppingCart,
  customers: Users,
  inventory: Warehouse,
  coupons: Tag,
  pricing: DollarSign,
  reports: ChartColumn,
  users: UserCog,
  settings: Settings
};

@Component({
  selector: 'app-admin-shell',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss'
})
export class AdminShellComponent {
  readonly iconSearch = Search;
  readonly iconBell = Bell;
  readonly iconMenu = Menu;
  readonly iconClose = X;
  readonly iconLogout = LogOut;

  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly navItems: ShellNavItem[] = adminNavItems.map((item) => ({
    ...item,
    fullPath: item.path ? `/${item.path}` : '/',
    exact: item.path === '',
    iconData: navIcons[item.path] ?? LayoutDashboard
  }));

  readonly sidebarOpen = signal(false);
  readonly exactActiveOptions = { exact: true } as const;
  readonly subsetActiveOptions = { exact: false } as const;

  get profileName(): string {
    return this.auth.currentUser?.fullName ?? 'Admin';
  }

  get profileRole(): string {
    const roles = this.auth.currentUser?.roles ?? [];
    if (roles.includes('ROLE_ADMIN')) {
      return 'Admin';
    }

    if (roles.includes('ROLE_MANAGER')) {
      return 'Manager';
    }

    if (roles.includes('ROLE_STAFF')) {
      return 'Staff';
    }

    if (roles.includes('ROLE_SUPER_ADMIN')) {
      return 'Super Admin';
    }

    return 'Authenticated';
  }

  get profileInitial(): string {
    const name = this.profileName.trim();
    return name ? name.charAt(0).toUpperCase() : 'A';
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigate(['/login']);
    });
  }

  trackByPath(_: number, item: ShellNavItem): string {
    return item.path;
  }
}
