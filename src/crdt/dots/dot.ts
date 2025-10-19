export class Dot {
  replica: number;
  sequence_number: number;

  constructor(replica: number, sequence_number: number) {
    this.replica = replica;
    this.sequence_number = sequence_number;
  }
}
