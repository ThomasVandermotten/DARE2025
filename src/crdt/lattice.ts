// Placeholder for when we need this. Might not be the ideal abstraction
interface Lattice {
  join(other: Lattice): Lattice;
  clone(): Lattice;
}
