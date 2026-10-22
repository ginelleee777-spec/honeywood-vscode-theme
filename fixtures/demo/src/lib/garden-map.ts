// A tiny map of the grove: places, paths between them, and a route finder.

export type PlaceKind = "meadow" | "stream" | "hollow" | "bridge";

export interface Place {
  readonly id: string;
  name: string;
  kind: PlaceKind;
  elevation: number;
}

export enum Weather {
  Sunny = "sunny",
  Breezy = "breezy",
  Rainy = "rainy",
}

const DEFAULT_SPEED_KMH = 3.5;
const SLUG = /^[a-z][a-z0-9-]*$/;

export class GroveMap {
  private paths = new Map<string, Set<string>>();

  constructor(private readonly places: Place[]) {
    for (const place of places) {
      if (!SLUG.test(place.id)) {
        throw new Error(`Invalid place id: "${place.id}"`);
      }
      this.paths.set(place.id, new Set());
    }
  }

  connect(from: string, to: string): this {
    this.paths.get(from)?.add(to);
    this.paths.get(to)?.add(from);
    return this;
  }

  /** Breadth-first search for the shortest walk between two places. */
  route(start: string, goal: string): string[] | null {
    const queue: string[][] = [[start]];
    const seen = new Set([start]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const here = path[path.length - 1];
      if (here === goal) return path;

      for (const next of this.paths.get(here) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push([...path, next]);
        }
      }
    }
    return null;
  }
}

export async function walkingTime(km: number, weather: Weather = Weather.Sunny): Promise<number> {
  const slowdown = weather === Weather.Rainy ? 1.4 : 1.0;
  return Math.round((km / DEFAULT_SPEED_KMH) * 60 * slowdown);
}

