import { createFileRoute } from '@tanstack/react-router';
import { SpacePage } from '../pages/SpacePage';

export const Route = createFileRoute('/spaces/$spaceId')({
  component: SpaceRoomRoute,
});

function SpaceRoomRoute() {
  const { spaceId } = Route.useParams();
  return <SpacePage spaceId={spaceId} />;
}
