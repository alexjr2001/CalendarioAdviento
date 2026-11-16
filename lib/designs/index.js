import design1 from './design1.js';
import design2 from './design2.js';
import design3 from './design3.js';
import design4 from './design4.js';

export const designDefinitions = { design1, design2, design3, design4 };

export function getDesignDefinition(design) {
  return designDefinitions[design] || design1;
}

export function hasDesignDefinition(design) {
  return Object.hasOwn(designDefinitions, design);
}

export function getDefaultSettings(design) {
  return Object.fromEntries(
    getDesignDefinition(design).fields.map(field => [field.key, field.defaultValue])
  );
}