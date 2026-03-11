import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Category } from '../../core/models/catalog.model';

@Component({
  selector: 'app-category-tile',
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './category-tile.component.html',
  styleUrl: './category-tile.component.css'
})
export class CategoryTileComponent {
  readonly category = input.required<Category>();
  readonly productCount = input<number | null>(null);
}
