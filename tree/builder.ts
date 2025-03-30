import { MenuItem, Customization, Category, CustomGroupConfig, PriceRange } from '../types';

export class MenuTreeBuilder {
  private readonly customGroups: Map<string, CustomGroupConfig>;
  private readonly customizations: Map<string, Customization>;
  
  constructor(
    private readonly menuItems: MenuItem[],
    categories: Category[],
    customizations: Customization[]
  ) {
    this.customGroups = new Map(
      categories
        .filter(c => c.type === 'custom_group')
        .map(c => [c.id, c.config!])
    );
    
    this.customizations = new Map(
      customizations.map(c => [c.id, c])
    );
  }

  buildTrees(): MenuItem[] {
    return this.menuItems.map(item => ({
      ...item,
      priceRange: this.calculatePriceRange(item)
    }));
  }

  private calculatePriceRange(item: MenuItem): PriceRange {
    return {
      lower: this.calculateBound(item, 'min'),
      upper: this.calculateBound(item, 'max')
    };
  }

  private calculateBound(item: MenuItem, boundType: 'min'|'max'): number {
    let total = item.basePrice;
    
    for (const groupId of item.customGroups) {
      const groupConfig = this.customGroups.get(groupId);
      if (!groupConfig) continue;

      const customizations = this.getGroupCustomizations(groupId);
      const sorted = this.sortCustomizations(customizations, boundType);
      const selections = sorted.slice(0, groupConfig[boundType]);

      total += selections.reduce((sum, c) => 
        sum + this.calculateCustomization(c, boundType), 0);
    }

    return total;
  }

  private calculateCustomization(customization: Customization, boundType: 'min'|'max'): number {
    let total = customization.price;
    
    for (const childGroupId of customization.childGroups) {
      const groupConfig = this.customGroups.get(childGroupId);
      if (!groupConfig) continue;

      const childCustomizations = this.getGroupCustomizations(childGroupId);
      const sorted = this.sortCustomizations(childCustomizations, boundType);
      const selections = sorted.slice(0, groupConfig[boundType]);

      total += selections.reduce((sum, c) => 
        sum + this.calculateCustomization(c, boundType), 0);
    }

    return total;
  }

  private getGroupCustomizations(groupId: string): Customization[] {
    return Array.from(this.customizations.values())
      .filter(c => c.parentGroupId === groupId);
  }

  private sortCustomizations(customizations: Customization[], boundType: 'min'|'max'): Customization[] {
    return [...customizations].sort((a, b) => 
      boundType === 'min' 
        ? a.price - b.price 
        : b.price - a.price
    );
  }
}