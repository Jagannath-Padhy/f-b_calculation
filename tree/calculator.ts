import { MenuItem, Customization, CustomGroupConfig } from '../types';

export class PriceCalculator {
  constructor(
    private readonly menuItem: MenuItem,
    private readonly customizations: Customization[],
    private readonly groups: Map<string, CustomGroupConfig>
  ) {}

  calculatePriceRange(): { lower: number; upper: number } {
    return {
      lower: this.calculateBound('min'),
      upper: this.calculateBound('max')
    };
  }

  private calculateBound(boundType: 'min'|'max'): number {
    return this.menuItem.basePrice + 
      this.processGroups(this.menuItem.customGroups, boundType);
  }

  private processGroups(
    groupIds: string[],
    boundType: 'min'|'max',
    depth = 0
  ): number {
    return groupIds.reduce((total, groupId) => {
      const groupConfig = this.groups.get(groupId);
      if (!groupConfig) return total;

      const customizations = this.getGroupCustomizations(groupId);
      const sorted = this.sortCustomizations(customizations, boundType);
      const selectionCount = boundType === 'min' ? groupConfig.min : groupConfig.max;
      const selected = sorted.slice(0, selectionCount);

      return total + selected.reduce((sum, customization) => {
        // Add customization price
        sum += customization.price;
        
        // Process child groups recursively
        if (customization.childGroups.length > 0) {
          sum += this.processGroups(customization.childGroups, boundType, depth + 1);
        }
        
        return sum;
      }, 0);
    }, 0);
  }

  private getGroupCustomizations(groupId: string): Customization[] {
    return this.customizations.filter(c => c.parentGroupId === groupId);
  }

  private sortCustomizations(
    customizations: Customization[], 
    boundType: 'min'|'max'
  ): Customization[] {
    return [...customizations].sort((a, b) => 
      boundType === 'min' ? a.price - b.price : b.price - a.price
    );
  }
}