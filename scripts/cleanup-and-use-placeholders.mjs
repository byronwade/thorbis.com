import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean up generated images and update to use placeholders
async function cleanupAndUsePlaceholders() {
  console.log('🧹 Cleaning up generated images and updating to placeholders...\n');
  
  // Step 1: Remove all generated product images
  console.log('🗑️ Removing generated product images...');
  const productsDir = path.join(process.cwd(), 'public', 'products');
  
  if (fs.existsSync(productsDir)) {
    // Remove the entire products directory
    fs.rmSync(productsDir, { recursive: true, force: true });
    console.log('✅ Removed public/products/ directory and all generated images');
  } else {
    console.log('ℹ️ No products directory found to remove');
  }
  
  // Step 2: Update product data to use placeholder images
  console.log('\n🔄 Updating product data to use placeholder images...');
  
  const productsPath = path.join(process.cwd(), 'src', 'data', 'products.js');
  let productsContent = fs.readFileSync(productsPath, 'utf8');
  
  // Extract product data using regex
  const productMatches = productsContent.match(/id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*image:\s*"([^"]+)",\s*price:\s*(\d+),/g);
  
  if (!productMatches) {
    throw new Error('Could not parse products from file');
  }
  
  const products = [];
  for (const match of productMatches) {
    const idMatch = match.match(/id:\s*"([^"]+)"/);
    const nameMatch = match.match(/name:\s*"([^"]+)"/);
    const priceMatch = match.match(/price:\s*(\d+)/);
    const categoryMatch = productsContent.substring(productsContent.indexOf(match)).match(/category:\s*"([^"]+)"/);
    
    if (idMatch && nameMatch && priceMatch && categoryMatch) {
      products.push({
        id: idMatch[1],
        name: nameMatch[1],
        price: parseInt(priceMatch[1]),
        category: categoryMatch[1]
      });
    }
  }
  
  console.log(`📊 Found ${products.length} products to update\n`);
  
  // Update each product's image path to use placeholder
  let updated = 0;
  for (const product of products) {
    try {
      // Use a generic placeholder image
      const placeholderImagePath = "/placeholder-business.svg";
      
      // Find and replace the image line for this specific product
      const productStart = productsContent.indexOf(`id: "${product.id}"`);
      if (productStart !== -1) {
        const productEnd = productsContent.indexOf('},', productStart);
        const productSection = productsContent.substring(productStart, productEnd);
        
        // Replace the image line
        const updatedSection = productSection.replace(
          /image:\s*"[^"]*",/,
          `image: "${placeholderImagePath}",`
        );
        
        // Update the main content
        productsContent = productsContent.replace(productSection, updatedSection);
        
        updated++;
        console.log(`✅ Updated ${product.name} to use placeholder image`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to update image path for ${product.name}:`, error);
    }
  }
  
  // Write the updated content back
  fs.writeFileSync(productsPath, productsContent);
  
  console.log(`\n🎉 Cleanup and placeholder update completed!`);
  console.log(`📊 Total products updated: ${updated}`);
  console.log(`🗑️ Removed all generated images`);
  console.log(`🖼️ All products now use placeholder: /placeholder-business.svg`);
  
  // Generate summary by category
  const categoryCounts = {};
  products.forEach(product => {
    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
  });
  
  console.log(`\n📋 Products by category:`);
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} products`);
  });
  
  console.log(`\n🚀 Next steps:`);
  console.log(`1. Test the store page to ensure all placeholders load correctly`);
  console.log(`2. Add real product images when ready`);
  console.log(`3. Consider implementing image optimization with Next.js Image component`);
  console.log(`4. Add blur placeholders for better UX`);
  
  return products;
}

// Run the cleanup and placeholder update
cleanupAndUsePlaceholders()
  .then(() => {
    console.log('\n✅ Cleanup and placeholder update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup and placeholder update failed:', error);
    process.exit(1);
  });
