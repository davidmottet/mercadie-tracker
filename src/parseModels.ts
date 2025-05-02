import Parse from 'parse';

// Classe pour stocker les objectifs nutritionnels
Parse.Object.registerSubclass('NutritionGoal', class extends Parse.Object {
  constructor() {
    super('NutritionGoal');
  }

  get name(): string {
    return this.get('name');
  }

  set name(value: string) {
    this.set('name', value);
  }

  get current(): number {
    return this.get('current');
  }

  set current(value: number) {
    this.set('current', value);
  }

  get target(): { health: number; diet: number } {
    return this.get('target');
  }

  set target(value: { health: number; diet: number }) {
    this.set('target', value);
  }

  get unit(): string {
    return this.get('unit');
  }

  set unit(value: string) {
    this.set('unit', value);
  }

  get color(): string {
    return this.get('color');
  }

  set color(value: string) {
    this.set('color', value);
  }
});

// Classe pour stocker les logs quotidiens
Parse.Object.registerSubclass('DailyLog', class extends Parse.Object {
  constructor() {
    super('DailyLog');
  }

  get date(): string {
    return this.get('date');
  }

  set date(value: string) {
    this.set('date', value);
  }

  get nutritionGoals(): Parse.Relation {
    return this.relation('nutritionGoals');
  }

  get activeMode(): 'health' | 'diet' {
    return this.get('activeMode');
  }

  set activeMode(value: 'health' | 'diet') {
    this.set('activeMode', value);
  }

  get user(): Parse.Pointer {
    return this.get('user');
  }

  set user(value: Parse.Pointer) {
    this.set('user', value);
  }
});

export { Parse }; 