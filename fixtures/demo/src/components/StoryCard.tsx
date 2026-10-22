import { type Place } from "../lib/garden-map";

interface StoryCardProps {
  place: Place;
  onOpen?: (id: string) => void;
}

export function StoryCard({ place, onOpen }: StoryCardProps) {
  return (
    <article className="story-card" onClick={() => onOpen?.(place.id)}>
      <h2>{place.name}</h2>
      <p>A {place.kind} at {place.elevation} m.</p>
    </article>
  );
}
