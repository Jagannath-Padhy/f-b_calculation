import { CatalogParser } from './catalog/parser';
import { catalog } from './load_json';
import { MenuTreeBuilder } from './tree/builder';
import { CatalogData } from './types';

// Load catalog data
const catalogData: CatalogData = loadCatalogData();

// Parse raw data
const categories = CatalogParser.parseCategories(catalogData.categories);
const menuItems = CatalogParser.parseMenuItems(catalogData.items);
const customizations = CatalogParser.parseCustomizations(catalogData.items);

// Build menu trees with price calculations
const treeBuilder = new MenuTreeBuilder(menuItems, categories, customizations);
const itemsWithPrices = treeBuilder.buildTrees();

// Output results
console.log('Calculated Price Ranges:');
itemsWithPrices.forEach(item => {
  console.log(`Item ${item.id}: ₹${item.priceRange?.lower} - ₹${item.priceRange?.upper}`);
});


function loadCatalogData(): CatalogData {
    // Assuming the JSON data is available as a variable `jsonData`
    console.log("categories :",catalog.categories,"items :", catalog.items);
    if (!catalog || !catalog.categories || !catalog.items) {
      throw new Error('Invalid catalog data');
    }
    
    return {
      categories: catalog.categories,
      items: catalog.items
    };
  }