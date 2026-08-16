export const pokemonTypes = [
  { name: 'Normal', tone: 'normal' }, { name: 'Fire', tone: 'fire' }, { name: 'Water', tone: 'water' },
  { name: 'Grass', tone: 'grass' }, { name: 'Lightning', tone: 'lightning' }, { name: 'Psychic', tone: 'psychic' },
  { name: 'Fighting', tone: 'fighting' }, { name: 'Flying', tone: 'flying' }, { name: 'Poison', tone: 'poison' },
  { name: 'Ground', tone: 'ground' }, { name: 'Bug', tone: 'bug' }, { name: 'Ghost', tone: 'ghost' },
  { name: 'Metal', tone: 'metal' }, { name: 'Ice', tone: 'ice' }, { name: 'Dragon', tone: 'dragon' },
  { name: 'Fairy', tone: 'fairy' }, { name: 'Stellar', tone: 'stellar' },
] as const;

export type PokemonType = (typeof pokemonTypes)[number]['name'];

export function TypeDecal({ type, small = false }: { type: PokemonType; small?: boolean }) {
  const decal = pokemonTypes.find((item) => item.name === type) ?? pokemonTypes[0];
  return <span className={`type-decal type-${decal.tone}${small ? ' type-decal-small' : ''}`} aria-label={decal.name} title={decal.name}><span className={`type-logo type-logo-${decal.tone}`} aria-hidden="true" />{!small && <span>{decal.name}</span>}</span>;
}
