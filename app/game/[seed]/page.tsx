import { GameClient } from "./GameClient";

type PageParams = { seed: string };

export default async function GamePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { seed } = await params;
  return <GameClient encodedSeed={seed} />;
}
