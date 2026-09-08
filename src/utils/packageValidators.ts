export interface LivestockValidationResult {
  hasCowOx: boolean;
  hasSheepGoat: boolean;
  hasLivestock: boolean;
  livestockName?: string;
}

/**
 * Checks if an item is a primary livestock animal (Cow/Ox or Sheep/Goat).
 * Excludes poultry (rooster/hen), eggs, and processed/packaged raw meat cuts.
 */
export function isLivestockCoreAnimal(item?: { id?: string; name?: string; category?: string } | null): boolean {
  if (!item) return false;
  const id = (item.id || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  // Explicit IDs from official catalog
  if (id === 'pkg-ox-01' || id === 'pkg-sheep-01' || id === 'pkg-goat-01') {
    return true;
  }

  // If category is provided and is NOT meat_livestock, it cannot be livestock
  if (item.category && item.category !== 'meat_livestock') {
    return false;
  }

  // Explicitly exclude poultry, eggs, and processed meat packs
  if (
    /rooster|hen|chicken|poultry|doro|ዶሮ|egg|እንቁላል/i.test(name) ||
    /5\s*kg|10\s*kg|cut|pack|ጥቅል/i.test(name) ||
    /hen|chicken|egg|meat/i.test(id)
  ) {
    return false;
  }

  // Match Cow/Ox (በሬ፣ ሰንጋ፣ ላም) or Sheep/Goat (በግ፣ ፍየል)
  return (
    /ox|cow|cattle|steer|bull|sanga|ሰንጋ|በሬ|ላም|ኮርማ/i.test(name) ||
    /sheep|ram|lamb|በግ|ጠቦት|ደንዳና/i.test(name) ||
    /goat|ፍየል|ሙክት/i.test(name) ||
    /ox|cow|sheep|goat/i.test(id)
  );
}

/**
 * Validates whether a list of items includes at least one Cow/Ox or Sheep/Goat.
 */
export function validatePackageLivestock(
  items?: Array<{ id?: string; name?: string; category?: string }> | null
): LivestockValidationResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { hasCowOx: false, hasSheepGoat: false, hasLivestock: false };
  }

  let hasCowOx = false;
  let hasSheepGoat = false;
  let livestockName: string | undefined = undefined;

  for (const item of items) {
    if (!item) continue;
    const id = (item.id || '').toLowerCase();
    const name = (item.name || '').toLowerCase();

    // Check if excluded (poultry, cut meat, eggs)
    if (
      /rooster|hen|chicken|poultry|doro|ዶሮ|egg|እንቁላል/i.test(name) ||
      /5\s*kg|10\s*kg|cut|pack|ጥቅል/i.test(name) ||
      /hen|chicken|egg/i.test(id)
    ) {
      continue;
    }

    if (
      id === 'pkg-ox-01' ||
      /ox|cow|cattle|steer|bull|sanga|ሰንጋ|በሬ|ላም|ኮርማ/i.test(name) ||
      /ox|cow/i.test(id)
    ) {
      hasCowOx = true;
      if (!livestockName) livestockName = item.name;
    } else if (
      id === 'pkg-sheep-01' ||
      id === 'pkg-goat-01' ||
      /sheep|ram|lamb|በግ|ጠቦት|ደንዳና|goat|ፍየል|ሙክት/i.test(name) ||
      /sheep|goat/i.test(id)
    ) {
      hasSheepGoat = true;
      if (!livestockName) livestockName = item.name;
    }
  }

  return {
    hasCowOx,
    hasSheepGoat,
    hasLivestock: hasCowOx || hasSheepGoat,
    livestockName
  };
}
